/**
 * Scheduled Notifications Cron Job
 * ส่งแจ้งเตือน adhkar, daily wisdom, quran reminder ตามเวลาที่กำหนด
 * ทำงานทุกชั่วโมง
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendPushMessage,
  buildMorningAdhkarMessage,
  buildEveningAdhkarMessage,
  buildDailyWisdomMessage,
  buildQuranReminderMessage,
} from '@/lib/line-messaging';
import { getCurrentHour } from '@/lib/prayer-times';

// Create Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CRON_SECRET = process.env.CRON_SECRET;

// Notification schedule
const NOTIFICATION_SCHEDULE = {
  adhkar_morning: 6, // 06:00
  daily_wisdom: 8, // 08:00
  adhkar_evening: 17, // 17:00
  quran_reminder: 20, // 20:00
} as const;

type NotificationType = keyof typeof NOTIFICATION_SCHEDULE;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting scheduled notification cron job...');

    // Get all active LINE connections with their preferences
    const { data: connections, error: fetchError } = await supabaseAdmin
      .from('user_line_connections')
      .select(
        `
        id,
        user_id,
        line_user_id,
        user_notification_preferences (
          adhkar_morning,
          adhkar_evening,
          daily_wisdom,
          quran_reminder,
          timezone
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

    // Get daily wisdom for today
    const wisdom = await getDailyWisdom();

    let sentCount = 0;
    const errors: string[] = [];
    const results: Record<NotificationType, number> = {
      adhkar_morning: 0,
      daily_wisdom: 0,
      adhkar_evening: 0,
      quran_reminder: 0,
    };

    // Group users by timezone and notification type
    for (const connection of connections) {
      const prefs = connection.user_notification_preferences as unknown as {
        adhkar_morning: boolean;
        adhkar_evening: boolean;
        daily_wisdom: boolean;
        quran_reminder: boolean;
        timezone: string;
      };

      if (!prefs) continue;

      const timezone = prefs.timezone || 'Asia/Bangkok';
      const currentHour = getCurrentHour(timezone);

      // Check each notification type
      for (const [notificationType, targetHour] of Object.entries(
        NOTIFICATION_SCHEDULE
      )) {
        const type = notificationType as NotificationType;

        // Check if it's the right hour for this notification
        if (currentHour !== targetHour) continue;

        // Check if user has enabled this notification
        if (!prefs[type]) continue;

        // Check if we already sent this notification today
        const alreadySent = await checkIfNotificationSent(
          connection.user_id,
          type
        );

        if (alreadySent) continue;

        // Build and send notification
        const messages = buildNotificationMessages(type, wisdom);
        const result = await sendPushMessage(connection.line_user_id, messages);

        // Log the notification
        await supabaseAdmin.from('notification_logs').insert({
          user_id: connection.user_id,
          line_user_id: connection.line_user_id,
          notification_type: type,
          message_content: `Scheduled notification: ${type}`,
          status: result.success ? 'sent' : 'failed',
          error_message: result.error || null,
          sent_at: result.success ? new Date().toISOString() : null,
        });

        if (result.success) {
          sentCount++;
          results[type]++;
          console.log(`Sent ${type} notification to ${connection.line_user_id}`);
        } else {
          errors.push(
            `Failed to send ${type} to ${connection.line_user_id}: ${result.error}`
          );
        }
      }
    }

    console.log(`Scheduled notification cron completed. Sent: ${sentCount}`);

    return NextResponse.json({
      success: true,
      message: 'Scheduled notifications processed',
      sent: sentCount,
      breakdown: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Scheduled Notification Cron Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build notification messages based on type
 */
function buildNotificationMessages(
  type: NotificationType,
  wisdom: DailyWisdom | null
) {
  switch (type) {
    case 'adhkar_morning':
      return buildMorningAdhkarMessage();

    case 'adhkar_evening':
      return buildEveningAdhkarMessage();

    case 'daily_wisdom':
      if (wisdom) {
        return buildDailyWisdomMessage(
          wisdom.arabic,
          wisdom.transliteration,
          wisdom.meaning_th,
          wisdom.source,
          wisdom.source_detail || undefined
        );
      }
      // Fallback if no wisdom
      return buildDailyWisdomMessage(
        'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        "Inna ma'al usri yusra",
        'แท้จริงพร้อมกับความยากลำบากนั้นมีความง่ายดาย',
        'Quran',
        'Surah Ash-Sharh 94:6'
      );

    case 'quran_reminder':
      return buildQuranReminderMessage();

    default:
      return [{ type: 'text' as const, text: 'Notification from Ibadah Station' }];
  }
}

interface DailyWisdom {
  id: string;
  arabic: string;
  transliteration: string;
  meaning_th: string;
  meaning_en: string;
  source: string;
  source_detail: string | null;
}

/**
 * Get today's daily wisdom
 */
async function getDailyWisdom(): Promise<DailyWisdom | null> {
  try {
    // Try to get wisdom for today's specific date first
    const today = new Date().toISOString().split('T')[0];

    const { data: specificWisdom } = await supabaseAdmin
      .from('daily_wisdom')
      .select('*')
      .eq('display_date', today)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (specificWisdom) {
      return specificWisdom;
    }

    // Get random wisdom based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const { data: wisdomList } = await supabaseAdmin
      .from('daily_wisdom')
      .select('*')
      .eq('is_active', true)
      .is('display_date', null);

    if (wisdomList && wisdomList.length > 0) {
      const index = dayOfYear % wisdomList.length;
      return wisdomList[index];
    }

    return null;
  } catch (error) {
    console.error('Error fetching daily wisdom:', error);
    return null;
  }
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
