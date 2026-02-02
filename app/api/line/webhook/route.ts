/**
 * LINE Webhook Endpoint
 * รับ events จาก LINE Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifySignature,
  getProfile,
  replyMessage,
  sendPushMessage,
  buildWelcomeMessage,
  buildAccountLinkedMessage,
  buildAccountUnlinkedMessage,
  WebhookBody,
  WebhookEvent,
} from '@/lib/line-messaging';

// Create Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // Verify signature
    if (!signature || !verifySignature(body, signature)) {
      console.error('Invalid LINE signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook body
    const webhookBody: WebhookBody = JSON.parse(body);

    // Process events
    for (const event of webhookBody.events) {
      await handleEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINE Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET request for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'LINE Webhook is ready' });
}

/**
 * Handle individual webhook event
 */
async function handleEvent(event: WebhookEvent): Promise<void> {
  const lineUserId = event.source.userId;

  if (!lineUserId) {
    console.log('Event without userId:', event.type);
    return;
  }

  switch (event.type) {
    case 'follow':
      await handleFollow(lineUserId, event.replyToken);
      break;

    case 'unfollow':
      await handleUnfollow(lineUserId);
      break;

    case 'message':
      await handleMessage(lineUserId, event);
      break;

    case 'accountLink':
      await handleAccountLink(lineUserId, event);
      break;

    case 'postback':
      await handlePostback(lineUserId, event);
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }
}

/**
 * Handle follow event (user adds the bot as friend)
 */
async function handleFollow(
  lineUserId: string,
  replyToken?: string
): Promise<void> {
  console.log('New follower:', lineUserId);

  // Get user profile
  const profile = await getProfile(lineUserId);
  const displayName = profile?.displayName || 'Friend';

  // Send welcome message
  if (replyToken) {
    await replyMessage(replyToken, buildWelcomeMessage(displayName));
  }

  // Log the follow event
  await supabase.from('notification_logs').insert({
    line_user_id: lineUserId,
    notification_type: 'follow',
    message_content: 'User followed the bot',
    status: 'sent',
    sent_at: new Date().toISOString(),
  });
}

/**
 * Handle unfollow event (user blocks or removes the bot)
 */
async function handleUnfollow(lineUserId: string): Promise<void> {
  console.log('User unfollowed:', lineUserId);

  // Deactivate LINE connection if exists
  const { error } = await supabase
    .from('user_line_connections')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('line_user_id', lineUserId);

  if (error) {
    console.error('Error deactivating LINE connection:', error);
  }

  // Log the unfollow event
  await supabase.from('notification_logs').insert({
    line_user_id: lineUserId,
    notification_type: 'unfollow',
    message_content: 'User unfollowed the bot',
    status: 'sent',
    sent_at: new Date().toISOString(),
  });
}

/**
 * Handle message event
 */
async function handleMessage(
  lineUserId: string,
  event: WebhookEvent
): Promise<void> {
  const message = event.message;

  if (!message || message.type !== 'text') {
    return;
  }

  const text = message.text?.toLowerCase() || '';

  // Check if user is linked
  const { data: connection } = await supabase
    .from('user_line_connections')
    .select('*')
    .eq('line_user_id', lineUserId)
    .eq('is_active', true)
    .single();

  // Handle common commands
  if (text === 'link' || text === 'ลิงก์' || text === 'เชื่อมต่อ') {
    if (connection) {
      await replyMessage(event.replyToken!, [
        {
          type: 'text',
          text: '✅ บัญชีของคุณเชื่อมต่อกับ Ibadah Station แล้ว\n\nตั้งค่าการแจ้งเตือนได้ที่:\nhttps://ibadah-station.vercel.app/th/settings/notifications',
        },
      ]);
    } else {
      await replyMessage(event.replyToken!, [
        {
          type: 'text',
          text: '🔗 ลิงก์บัญชีของคุณกับ Ibadah Station:\n\nhttps://ibadah-station.vercel.app/th/settings/notifications\n\nกรุณา login และกดปุ่ม "เชื่อมต่อ LINE"',
        },
      ]);
    }
    return;
  }

  if (text === 'unlink' || text === 'ยกเลิก' || text === 'ตัดการเชื่อมต่อ') {
    if (connection) {
      // Deactivate connection
      await supabase
        .from('user_line_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('line_user_id', lineUserId);

      await replyMessage(event.replyToken!, buildAccountUnlinkedMessage());
    } else {
      await replyMessage(event.replyToken!, [
        {
          type: 'text',
          text: 'บัญชีของคุณยังไม่ได้เชื่อมต่อกับ Ibadah Station',
        },
      ]);
    }
    return;
  }

  if (text === 'status' || text === 'สถานะ') {
    if (connection) {
      // Get notification preferences
      const { data: prefs } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', connection.user_id)
        .single();

      const status = `📊 สถานะบัญชีของคุณ

✅ เชื่อมต่อแล้ว

การแจ้งเตือน:
🕌 เวลาละหมาด: ${prefs?.prayer_fajr ? 'เปิด' : 'ปิด'}
🌅 อัซการเช้า: ${prefs?.adhkar_morning ? 'เปิด' : 'ปิด'}
🌆 อัซการเย็น: ${prefs?.adhkar_evening ? 'เปิด' : 'ปิด'}
✨ ข้อคิดประจำวัน: ${prefs?.daily_wisdom ? 'เปิด' : 'ปิด'}
📖 เตือนอ่านอัลกุรอาน: ${prefs?.quran_reminder ? 'เปิด' : 'ปิด'}

📍 พื้นที่: ${prefs?.location_name || 'Bangkok'}

ตั้งค่าการแจ้งเตือน:
https://ibadah-station.vercel.app/th/settings/notifications`;

      await replyMessage(event.replyToken!, [{ type: 'text', text: status }]);
    } else {
      await replyMessage(event.replyToken!, [
        {
          type: 'text',
          text: '❌ บัญชีของคุณยังไม่ได้เชื่อมต่อ\n\nลิงก์บัญชี:\nhttps://ibadah-station.vercel.app/th/settings/notifications',
        },
      ]);
    }
    return;
  }

  if (text === 'help' || text === 'ช่วยเหลือ' || text === '?') {
    const helpText = `🌙 Ibadah Station - Help

คำสั่งที่ใช้ได้:
• link / ลิงก์ - เชื่อมต่อบัญชี
• unlink / ยกเลิก - ตัดการเชื่อมต่อ
• status / สถานะ - ดูสถานะบัญชี
• help / ช่วยเหลือ - แสดงข้อความนี้

🔗 เว็บไซต์:
https://ibadah-station.vercel.app

#IbadahStation`;

    await replyMessage(event.replyToken!, [{ type: 'text', text: helpText }]);
    return;
  }

  // Default response for unrecognized messages
  await replyMessage(event.replyToken!, [
    {
      type: 'text',
      text: 'พิมพ์ "help" หรือ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้ได้',
    },
  ]);
}

/**
 * Handle account link event
 */
async function handleAccountLink(
  lineUserId: string,
  event: WebhookEvent
): Promise<void> {
  const linkResult = event.link;

  if (!linkResult) {
    return;
  }

  if (linkResult.result === 'ok') {
    console.log('Account linked successfully:', lineUserId, linkResult.nonce);

    // The actual linking is done in the link API endpoint
    // This event just confirms it was successful

    // Send confirmation message
    await sendPushMessage(lineUserId, buildAccountLinkedMessage());
  } else {
    console.log('Account link failed:', lineUserId);
  }
}

/**
 * Handle postback event
 */
async function handlePostback(
  lineUserId: string,
  event: WebhookEvent
): Promise<void> {
  const postbackData = event.postback?.data;

  if (!postbackData) {
    return;
  }

  console.log('Postback data:', postbackData);

  // Parse postback data (format: action=xxx&param=yyy)
  const params = new URLSearchParams(postbackData);
  const action = params.get('action');

  switch (action) {
    case 'link':
      await replyMessage(event.replyToken!, [
        {
          type: 'text',
          text: '🔗 ลิงก์บัญชี:\nhttps://ibadah-station.vercel.app/th/settings/notifications',
        },
      ]);
      break;

    case 'settings':
      await replyMessage(event.replyToken!, [
        {
          type: 'text',
          text: '⚙️ ตั้งค่าการแจ้งเตือน:\nhttps://ibadah-station.vercel.app/th/settings/notifications',
        },
      ]);
      break;

    default:
      console.log('Unknown postback action:', action);
  }
}
