/**
 * LINE Messaging API Client
 * สำหรับส่งข้อความแจ้งเตือนผ่าน LINE
 */

import crypto from 'crypto';

// Types
export interface LineMessage {
  type: 'text' | 'flex';
  text?: string;
  altText?: string;
  contents?: FlexContainer;
}

export interface FlexContainer {
  type: 'bubble' | 'carousel';
  body?: FlexBox;
  footer?: FlexBox;
  [key: string]: unknown;
}

export interface FlexBox {
  type: 'box';
  layout: 'vertical' | 'horizontal' | 'baseline';
  contents: FlexComponent[];
  [key: string]: unknown;
}

export interface FlexComponent {
  type: 'text' | 'button' | 'box' | 'image' | 'separator' | 'spacer';
  [key: string]: unknown;
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface WebhookEvent {
  type: 'message' | 'follow' | 'unfollow' | 'postback' | 'accountLink';
  timestamp: number;
  source: {
    type: 'user' | 'group' | 'room';
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  replyToken?: string;
  message?: {
    type: string;
    id: string;
    text?: string;
  };
  postback?: {
    data: string;
  };
  link?: {
    result: 'ok' | 'failed';
    nonce: string;
  };
}

export interface WebhookBody {
  destination: string;
  events: WebhookEvent[];
}

// Configuration
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const LINE_API_BASE_URL = 'https://api.line.me/v2/bot';

/**
 * Verify LINE webhook signature
 */
export function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) {
    console.error('LINE_CHANNEL_SECRET is not configured');
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  return hash === signature;
}

/**
 * Send push message to a single user
 */
export async function sendPushMessage(
  lineUserId: string,
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${LINE_API_BASE_URL}/message/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: messages.map(formatMessage),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE Push Message Error:', errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('LINE Push Message Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send multicast message to multiple users (max 500)
 */
export async function sendMulticast(
  lineUserIds: string[],
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  if (lineUserIds.length === 0) {
    return { success: true };
  }

  if (lineUserIds.length > 500) {
    console.error('Multicast limit exceeded: max 500 users per request');
    return { success: false, error: 'Max 500 users per multicast request' };
  }

  try {
    const response = await fetch(`${LINE_API_BASE_URL}/message/multicast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserIds,
        messages: messages.map(formatMessage),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE Multicast Error:', errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('LINE Multicast Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reply to a webhook event
 */
export async function replyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${LINE_API_BASE_URL}/message/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: messages.map(formatMessage),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE Reply Error:', errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('LINE Reply Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user profile
 */
export async function getProfile(
  lineUserId: string
): Promise<LineProfile | null> {
  try {
    const response = await fetch(`${LINE_API_BASE_URL}/profile/${lineUserId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('LINE Get Profile Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('LINE Get Profile Error:', error);
    return null;
  }
}

/**
 * Issue a link token for account linking
 */
export async function issueLinkToken(
  lineUserId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${LINE_API_BASE_URL}/user/${lineUserId}/linkToken`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('LINE Issue Link Token Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.linkToken;
  } catch (error) {
    console.error('LINE Issue Link Token Error:', error);
    return null;
  }
}

/**
 * Format message for LINE API
 */
function formatMessage(message: LineMessage): object {
  if (message.type === 'text') {
    return {
      type: 'text',
      text: message.text,
    };
  }

  if (message.type === 'flex') {
    return {
      type: 'flex',
      altText: message.altText || 'Notification',
      contents: message.contents,
    };
  }

  return message;
}

// =============================================
// Notification Message Builders
// =============================================

/**
 * Build prayer time notification message
 */
export function buildPrayerNotificationMessage(
  prayerName: string,
  prayerNameAr: string,
  time: string,
  locationName: string
): LineMessage[] {
  const text = `🕌 ได้เวลาละหมาด${prayerName}แล้ว

⏰ เวลา: ${time}
📍 ${locationName}

"وَأَقِيمُوا الصَّلَاةَ"
และจงดำรงการละหมาด

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build morning adhkar notification message
 */
export function buildMorningAdhkarMessage(): LineMessage[] {
  const text = `🌅 อัซการเช้า - Morning Adhkar

สุบหานัลลอฮฺ 33 ครั้ง
อัลฮัมดุลิลลาฮฺ 33 ครั้ง
อัลลอฮุอักบัร 33 ครั้ง

"أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ"
เราได้เข้าสู่ยามเช้า และอำนาจทั้งมวลเป็นของอัลลอฮ์

🔗 ดูอัซการทั้งหมด:
https://ibadah-station.vercel.app/th/journey/morning-evening-adhkar

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build evening adhkar notification message
 */
export function buildEveningAdhkarMessage(): LineMessage[] {
  const text = `🌆 อัซการเย็น - Evening Adhkar

สุบหานัลลอฮฺ 33 ครั้ง
อัลฮัมดุลิลลาฮฺ 33 ครั้ง
อัลลอฮุอักบัร 33 ครั้ง

"أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ"
เราได้เข้าสู่ยามเย็น และอำนาจทั้งมวลเป็นของอัลลอฮ์

🔗 ดูอัซการทั้งหมด:
https://ibadah-station.vercel.app/th/journey/morning-evening-adhkar

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build daily wisdom notification message
 */
export function buildDailyWisdomMessage(
  arabic: string,
  transliteration: string,
  meaningTh: string,
  source: string,
  sourceDetail?: string
): LineMessage[] {
  const sourceText = sourceDetail ? `${source} - ${sourceDetail}` : source;

  const text = `✨ ข้อคิดประจำวัน

${arabic}

"${transliteration}"

${meaningTh}

📖 ${sourceText}

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build Quran reminder notification message
 */
export function buildQuranReminderMessage(): LineMessage[] {
  const text = `📖 Quran Reminder

อย่าลืมอ่านอัลกุรอานวันนี้นะครับ

"خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
ผู้ที่ดีที่สุดในหมู่พวกท่าน คือผู้ที่เรียนอัลกุรอานและสอนมัน
(หะดีษ บุคอรีย์)

🔗 อ่านอัลกุรอาน:
https://ibadah-station.vercel.app/th/quran

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build welcome message for new followers
 */
export function buildWelcomeMessage(displayName: string): LineMessage[] {
  const text = `อัสลามุอะลัยกุม ${displayName} 🌙

ยินดีต้อนรับสู่ Ibadah Station

เพื่อรับการแจ้งเตือนเวลาละหมาด อัซการเช้าเย็น ข้อคิดประจำวัน และการอ่านอัลกุรอาน กรุณาลิงก์บัญชีของคุณ:

🔗 ลิงก์บัญชี:
https://ibadah-station.vercel.app/th/settings/notifications

หลังจากลิงก์บัญชีแล้ว คุณจะสามารถ:
✅ รับแจ้งเตือนเวลาละหมาดตาม location ของคุณ
✅ รับแจ้งเตือนอัซการเช้าและเย็น
✅ รับข้อคิดประจำวันจากอัลกุรอานและหะดีษ
✅ รับการเตือนให้อ่านอัลกุรอาน

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build account linked success message
 */
export function buildAccountLinkedMessage(): LineMessage[] {
  const text = `✅ ลิงก์บัญชีสำเร็จ!

บัญชี LINE ของคุณได้เชื่อมต่อกับ Ibadah Station แล้ว

คุณจะเริ่มได้รับการแจ้งเตือนตามการตั้งค่าของคุณ:
🕌 เวลาละหมาด
🌅 อัซการเช้า (06:00)
🌆 อัซการเย็น (17:00)
✨ ข้อคิดประจำวัน (08:00)
📖 เตือนอ่านอัลกุรอาน (20:00)

ตั้งค่าการแจ้งเตือนได้ที่:
https://ibadah-station.vercel.app/th/settings/notifications

#IbadahStation`;

  return [{ type: 'text', text }];
}

/**
 * Build account unlinked message
 */
export function buildAccountUnlinkedMessage(): LineMessage[] {
  const text = `🔓 ยกเลิกการลิงก์บัญชีแล้ว

บัญชี LINE ของคุณได้ยกเลิกการเชื่อมต่อกับ Ibadah Station แล้ว

คุณจะไม่ได้รับการแจ้งเตือนอีกต่อไป

หากต้องการเชื่อมต่อใหม่:
https://ibadah-station.vercel.app/th/settings/notifications

#IbadahStation`;

  return [{ type: 'text', text }];
}
