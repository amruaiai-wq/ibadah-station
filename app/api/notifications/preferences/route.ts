/**
 * Notification Preferences API
 * จัดการการตั้งค่า notification ของผู้ใช้
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchPrayerTimes } from '@/lib/prayer-times';

// Create Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's notification preferences
    const { data: preferences, error: fetchError } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching preferences:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          prayer_fajr: true,
          prayer_dhuhr: true,
          prayer_asr: true,
          prayer_maghrib: true,
          prayer_isha: true,
          prayer_reminder_minutes: 10,
          adhkar_morning: true,
          adhkar_evening: true,
          daily_wisdom: true,
          quran_reminder: true,
          latitude: 13.7563,
          longitude: 100.5018,
          timezone: 'Asia/Bangkok',
          location_name: 'Bangkok',
        },
        exists: false,
      });
    }

    return NextResponse.json({
      preferences: {
        prayer_fajr: preferences.prayer_fajr,
        prayer_dhuhr: preferences.prayer_dhuhr,
        prayer_asr: preferences.prayer_asr,
        prayer_maghrib: preferences.prayer_maghrib,
        prayer_isha: preferences.prayer_isha,
        prayer_reminder_minutes: preferences.prayer_reminder_minutes,
        adhkar_morning: preferences.adhkar_morning,
        adhkar_evening: preferences.adhkar_evening,
        daily_wisdom: preferences.daily_wisdom,
        quran_reminder: preferences.quran_reminder,
        latitude: parseFloat(preferences.latitude),
        longitude: parseFloat(preferences.longitude),
        timezone: preferences.timezone,
        location_name: preferences.location_name,
      },
      exists: true,
    });
  } catch (error) {
    console.error('Get Preferences Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();

    // Validate and sanitize input
    const updates: Record<string, unknown> = {};

    // Boolean fields
    const booleanFields = [
      'prayer_fajr',
      'prayer_dhuhr',
      'prayer_asr',
      'prayer_maghrib',
      'prayer_isha',
      'adhkar_morning',
      'adhkar_evening',
      'daily_wisdom',
      'quran_reminder',
    ];

    for (const field of booleanFields) {
      if (typeof body[field] === 'boolean') {
        updates[field] = body[field];
      }
    }

    // Numeric fields
    if (typeof body.prayer_reminder_minutes === 'number') {
      updates.prayer_reminder_minutes = Math.max(
        0,
        Math.min(60, body.prayer_reminder_minutes)
      );
    }

    // Location fields
    if (typeof body.latitude === 'number' && typeof body.longitude === 'number') {
      // Validate coordinates
      if (
        body.latitude >= -90 &&
        body.latitude <= 90 &&
        body.longitude >= -180 &&
        body.longitude <= 180
      ) {
        updates.latitude = body.latitude;
        updates.longitude = body.longitude;

        // Update prayer times cache for today
        await updatePrayerTimesCache(user.id, body.latitude, body.longitude);
      }
    }

    if (typeof body.timezone === 'string') {
      updates.timezone = body.timezone;
    }

    if (typeof body.location_name === 'string') {
      updates.location_name = body.location_name.substring(0, 100);
    }

    // Check if we have any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Upsert preferences
    const { data: updatedPrefs, error: updateError } = await supabaseAdmin
      .from('user_notification_preferences')
      .upsert(
        {
          user_id: user.id,
          ...updates,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (updateError) {
      console.error('Error updating preferences:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        prayer_fajr: updatedPrefs.prayer_fajr,
        prayer_dhuhr: updatedPrefs.prayer_dhuhr,
        prayer_asr: updatedPrefs.prayer_asr,
        prayer_maghrib: updatedPrefs.prayer_maghrib,
        prayer_isha: updatedPrefs.prayer_isha,
        prayer_reminder_minutes: updatedPrefs.prayer_reminder_minutes,
        adhkar_morning: updatedPrefs.adhkar_morning,
        adhkar_evening: updatedPrefs.adhkar_evening,
        daily_wisdom: updatedPrefs.daily_wisdom,
        quran_reminder: updatedPrefs.quran_reminder,
        latitude: parseFloat(updatedPrefs.latitude),
        longitude: parseFloat(updatedPrefs.longitude),
        timezone: updatedPrefs.timezone,
        location_name: updatedPrefs.location_name,
      },
    });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update prayer times cache for a user
 */
async function updatePrayerTimesCache(
  userId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  try {
    const today = new Date();
    const prayerTimes = await fetchPrayerTimes(latitude, longitude, today);

    if (!prayerTimes) {
      console.error('Failed to fetch prayer times for cache update');
      return;
    }

    // Upsert prayer times cache
    await supabaseAdmin.from('prayer_times_cache').upsert(
      {
        user_id: userId,
        date: today.toISOString().split('T')[0],
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
  } catch (error) {
    console.error('Error updating prayer times cache:', error);
  }
}
