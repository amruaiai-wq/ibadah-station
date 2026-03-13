// ======================================
// Content Feedback & Error Report Types
// ======================================

export type FeedbackStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type PageType = 'journey' | 'article' | 'quiz' | 'wisdom' | 'qna' | 'other';

export interface FeedbackCategory {
  id: string;
  slug: string;
  name_th: string;
  name_en: string;
  icon?: string;
  sort_order: number;
  created_at: string;
}

export interface ContentFeedback {
  id: string;

  // User info
  user_id?: string;
  user_email?: string;

  // Content location
  page_type: PageType;
  page_path: string;
  page_title?: string;
  content_id?: string;
  content_excerpt?: string;

  // Feedback details
  category_id?: string;
  category_slug?: string;
  subject: string;
  description: string;
  suggested_correction?: string;

  // Metadata
  user_agent?: string;
  locale: string;
  screenshot_url?: string;

  // Admin handling
  status: FeedbackStatus;
  admin_note?: string;
  resolved_by?: string;
  resolved_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Joined data
  category?: FeedbackCategory;
  user?: {
    email?: string;
    display_name?: string;
  };
}

export interface CreateFeedbackInput {
  // User info (optional for anonymous)
  user_email?: string;

  // Content location
  page_type: PageType;
  page_path: string;
  page_title?: string;
  content_id?: string;
  content_excerpt?: string;

  // Feedback details
  category_slug: string;
  subject: string;
  description: string;
  suggested_correction?: string;

  // Metadata
  locale: string;
  screenshot_url?: string;
}

export interface UpdateFeedbackInput {
  status?: FeedbackStatus;
  admin_note?: string;
}

export interface FeedbackStats {
  total_feedback: number;
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  by_category: Record<string, number>;
}

export interface FeedbackFilters {
  status?: FeedbackStatus;
  page_type?: PageType;
  category_slug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
