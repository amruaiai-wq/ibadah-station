/**
 * Prayer Notifications Cron Job
 * ส่งแจ้งเตือนเวลาละหมาด
 * ทำงานทุก 5 นาที
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendPushMessage,
  buildPrayerNotificationMessage,
} from '@/lib/line-messaging';
import {
  fetchPrayerTimes,
  getCurrentTimeString,
  timeToMinutes,
  PRAYER_NAMES,
} from '@/lib/prayer-times';

// Create Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CRON_SECRET = process.env.CRON_SECRET;

// Prayer types to check (excluding sunrise)
const PRAYER_TYPES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type PrayerType = (typeof PRAYER_TYPES)[number];

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      // Also check for Vercel cron header
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting prayer notification cron job...');

    // Get all active LINE connections with their preferences
    const { data: connections, error: fetchError } = await supabaseAdmin
      .from('user_line_connections')
      .select(
        `
        id,
        user_id,
        line_user_id,
        user_notification_preferences (
          prayer_fajr,
          prayer_dhuhr,
          prayer_asr,
          prayer_maghrib,
          prayer_isha,
          prayer_reminder_minutes,
          latitude,
          longitude,
          timezone,
          location_name
        )
      `
      )
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching connections:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch connections' },
        { status: 500 }
      );
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active connections',
        sent: 0,
      });
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Process each user
    for (const connection of connections) {
      const prefs = connection.user_notification_preferences as unknown as {
        prayer_fajr: boolean;
        prayer_dhuhr: boolean;
        prayer_asr: boolean;
        prayer_maghrib: boolean;
        prayer_isha: boolean;
        prayer_reminder_minutes: number;
        latitude: string;
        longitude: string;
        timezone: string;
        location_name: string;
      };

      if (!prefs) continue;

      const latitude = parseFloat(prefs.latitude);
      const longitude = parseFloat(prefs.longitude);
      const timezone = prefs.timezone || 'Asia/Bangkok';
      const locationName = prefs.location_name || 'Bangkok';
      const reminderMinutes = prefs.prayer_reminder_minutes || 10;

      // Get current time in user's timezone
      const currentTime = getCurrentTimeString(timezone);
      const currentMinutes = timeToMinutes(currentTime);

      // Get or fetch prayer times for today
      const prayerTimes = await getPrayerTimesForUser(
        connection.user_id,
        latitude,
        longitude
      );

      if (!prayerTimes) {
        errors.push(`Failed to get prayer times for user ${connection.user_id}`);
        continue;
      }

      // Check each prayer time
      for (const prayer of PRAYER_TYPES) {
        // Check if user has enabled this prayer notification
        const prefKey = `prayer_${prayer}` as keyof typeof prefs;
        if (!prefs[prefKey]) continue;

        const prayerTime = prayerTimes[prayer];
        const prayerMinutes = timeToMinutes(prayerTime);
        const notifyMinutes = prayerMinutes - reminderMinutes;

        // Check if current time is within 5 minutes of notification time
        const diff = currentMinutes - notifyMinutes;
        if (diff >= 0 && diff < 5) {
          // Check if we already sent this notification today
          const alreadySent = await checkIfNotificationSent(
            connection.user_id,
            `prayer_${prayer}`
          );

          if (alreadySent) continue;

          // Send notification
          const prayerInfo = PRAYER_NAMES[prayer];
          const result = await sendPushMessage(
            connection.line_user_id,
            buildPrayerNotificationMessage(
              prayerInfo.th,
              prayerInfo.ar,
              prayerTime,
              locationName
            )
          );

          // Log the notification
          await supabaseAdmin.from('notification_logs').insert({
            user_id: connection.user_id,
            line_user_id: connection.line_user_id,
            notification_type: `prayer_${prayer}`,
            message_content: `Prayer notification for ${prayer}`,
            status: result.success ? 'sent' : 'failed',
            error_message: result.error || null,
            sent_at: result.success ? new Date().toISOString() : null,
          });

          if (result.success) {
            sentCount++;
            console.log(
              `Sent ${prayer} notification to ${connection.line_user_id}`
            );
          } else {
            errors.push(
              `Failed to send ${prayer} to ${connection.line_user_id}: ${result.error}`
            );
          }
        }
      }
    }

    console.log(`Prayer notification cron completed. Sent: ${sentCount}`);

    return NextResponse.json({
      success: true,
      message: 'Prayer notifications processed',
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Prayer Notification Cron Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get prayer times for user (from cache or fetch)
 */
async function getPrayerTimesForUser(
  userId: string,
  latitude: number,
  longitude: number
): Promise<Record<PrayerType | 'sunrise', string> | null> {
  const today = new Date().toISOString().split('T')[0];

  // Try to get from cache
  const { data: cached } = await supabaseAdmin
    .from('prayer_times_cache')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (cached) {
    return {
      fajr: cached.fajr,
      sunrise: cached.sunrise,
      dhuhr: cached.dhuhr,
      asr: cached.asr,
      maghrib: cached.maghrib,
      isha: cached.isha,
    };
  }

  // Fetch from API
  const prayerTimes = await fetchPrayerTimes(latitude, longitude);

  if (!prayerTimes) {
    return null;
  }

  // Save to cache
  await supabaseAdmin.from('prayer_times_cache').upsert(
    {
      user_id: userId,
      date: today,
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      latitude,
      longitude,
    },
    { onConflict: 'user_id,date' }
  );

  return prayerTimes;
}

/**
 * Check if notification was already sent today
 */
async function checkIfNotificationSent(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabaseAdmin
    .from('notification_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_type', notificationType)
    .eq('status', 'sent')
    .gte('created_at', today.toISOString())
    .limit(1);

  return (data && data.length > 0) || false;
}
