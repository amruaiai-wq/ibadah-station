import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if credentials are available
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Types for database
export interface DailyWisdom {
  id: string;
  arabic: string;
  transliteration: string;
  meaning_th: string;
  meaning_en: string;
  source: string;
  source_detail?: string;
  is_active: boolean;
  display_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title_th: string;
  title_en: string;
  excerpt_th: string;
  excerpt_en: string;
  content_th: string;
  content_en: string;
  cover_image?: string;
  category: 'salah' | 'umrah' | 'hajj' | 'zakat' | 'sawm' | 'adhkar' | 'general';
  tags: string[];
  is_published: boolean;
  published_at?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: string;
  page_path: string;
  user_agent?: string;
  ip_hash?: string;
  country?: string;
  referrer?: string;
  session_id?: string;
  created_at: string;
}

export interface DailyStats {
  date: string;
  total_views: number;
  unique_visitors: number;
  top_pages: { path: string; views: number }[];
}

// LINE Notification Types
export interface UserLineConnection {
  id: string;
  user_id: string;
  line_user_id: string;
  display_name?: string;
  picture_url?: string;
  is_active: boolean;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  prayer_fajr: boolean;
  prayer_dhuhr: boolean;
  prayer_asr: boolean;
  prayer_maghrib: boolean;
  prayer_isha: boolean;
  prayer_reminder_minutes: number;
  adhkar_morning: boolean;
  adhkar_evening: boolean;
  daily_wisdom: boolean;
  quran_reminder: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  location_name: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  user_id?: string;
  line_user_id: string;
  notification_type: string;
  message_content?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface PrayerTimesCache {
  id: string;
  user_id: string;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface LineLinkToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}
