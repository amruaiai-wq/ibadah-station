/**
 * LINE Account Unlink API
 * ยกเลิกการเชื่อมต่อ LINE กับ user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendPushMessage,
  buildAccountUnlinkedMessage,
} from '@/lib/line-messaging';

// Create Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/line/unlink
 * Unlink LINE account from user account
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

    // Get user's active LINE connection
    const { data: connection, error: fetchError } = await supabaseAdmin
      .from('user_line_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: 'No active LINE connection found' },
        { status: 404 }
      );
    }

    // Deactivate the connection
    const { error: updateError } = await supabaseAdmin
      .from('user_line_connections')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    if (updateError) {
      console.error('Error unlinking LINE:', updateError);
      return NextResponse.json(
        { error: 'Failed to unlink account' },
        { status: 500 }
      );
    }

    // Send notification to LINE user
    try {
      await sendPushMessage(connection.line_user_id, buildAccountUnlinkedMessage());
    } catch (lineError) {
      // Don't fail if LINE message fails (user might have blocked the bot)
      console.warn('Failed to send unlink notification to LINE:', lineError);
    }

    // Log the unlink
    await supabaseAdmin.from('notification_logs').insert({
      user_id: user.id,
      line_user_id: connection.line_user_id,
      notification_type: 'account_unlink',
      message_content: 'User unlinked their LINE account',
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Account unlinked successfully',
    });
  } catch (error) {
    console.error('LINE Unlink Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
