/**
 * LINE Account Link API
 * เชื่อมต่อ LINE กับ user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getProfile,
  sendPushMessage,
  buildAccountLinkedMessage,
} from '@/lib/line-messaging';

// Create Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/line/link
 * Link LINE account with user account
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify user token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { lineUserId } = body;

    if (!lineUserId) {
      return NextResponse.json(
        { error: 'lineUserId is required' },
        { status: 400 }
      );
    }

    // Check if LINE user is already linked to another account
    const { data: existingConnection } = await supabaseAdmin
      .from('user_line_connections')
      .select('*')
      .eq('line_user_id', lineUserId)
      .eq('is_active', true)
      .single();

    if (existingConnection && existingConnection.user_id !== user.id) {
      return NextResponse.json(
        { error: 'This LINE account is already linked to another user' },
        { status: 400 }
      );
    }

    // Check if user already has a LINE connection
    const { data: userConnection } = await supabaseAdmin
      .from('user_line_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (userConnection) {
      // If same LINE user, just return success
      if (userConnection.line_user_id === lineUserId) {
        return NextResponse.json({
          success: true,
          message: 'Already linked',
          connection: userConnection,
        });
      }

      // Different LINE user, deactivate old connection
      await supabaseAdmin
        .from('user_line_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userConnection.id);
    }

    // Get LINE profile
    const profile = await getProfile(lineUserId);

    // Create new connection
    const { data: newConnection, error: insertError } = await supabaseAdmin
      .from('user_line_connections')
      .insert({
        user_id: user.id,
        line_user_id: lineUserId,
        display_name: profile?.displayName || null,
        picture_url: profile?.pictureUrl || null,
        is_active: true,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating LINE connection:', insertError);
      return NextResponse.json(
        { error: 'Failed to create connection' },
        { status: 500 }
      );
    }

    // Create default notification preferences if not exists
    await supabaseAdmin.from('user_notification_preferences').upsert(
      {
        user_id: user.id,
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
      { onConflict: 'user_id' }
    );

    // Send confirmation message to LINE
    await sendPushMessage(lineUserId, buildAccountLinkedMessage());

    return NextResponse.json({
      success: true,
      message: 'Account linked successfully',
      connection: newConnection,
    });
  } catch (error) {
    console.error('LINE Link Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/line/link
 * Get current user's LINE connection status
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

    // Get user's LINE connection
    const { data: connection } = await supabaseAdmin
      .from('user_line_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!connection) {
      return NextResponse.json({
        connected: false,
        connection: null,
      });
    }

    return NextResponse.json({
      connected: true,
      connection: {
        id: connection.id,
        lineUserId: connection.line_user_id,
        displayName: connection.display_name,
        pictureUrl: connection.picture_url,
        connectedAt: connection.connected_at,
      },
    });
  } catch (error) {
    console.error('Get LINE Connection Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

