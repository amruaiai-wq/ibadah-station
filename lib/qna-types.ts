// Q&A TypeScript interfaces

export interface QuestionCategory {
  id: string;
  slug: string;
  name_th: string;
  name_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string | null;
  category_id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered' | 'closed';
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: QuestionCategory;
  user?: UserProfile | null;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  question_id: string;
  admin_id: string;
  content: string;
  sources: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined data
  admin?: AdminUser;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_locale: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithDetails extends Question {
  category: QuestionCategory;
  user: UserProfile | null;
  answers: Answer[];
}

export interface CreateQuestionInput {
  category_id: string;
  title: string;
  content: string;
}

export interface CreateAnswerInput {
  question_id: string;
  content: string;
  sources?: string[];
}
