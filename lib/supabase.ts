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
