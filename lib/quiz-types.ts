// Quiz Types for Ibadah Station

export interface Quiz {
  id: string;
  title_th: string;
  title_en: string;
  description_th?: string;
  description_en?: string;
  category: 'salah' | 'wudu' | 'umrah' | 'hajj' | 'zakat' | 'sawm' | 'adhkar' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_minutes?: number;
  is_published: boolean;
  questions_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  order_number: number;
  question_th: string;
  question_en: string;
  option_1_th: string;
  option_1_en: string;
  option_2_th: string;
  option_2_en: string;
  option_3_th: string;
  option_3_en: string;
  option_4_th: string;
  option_4_en: string;
  correct_answer: 1 | 2 | 3 | 4;
  explanation_th?: string;
  explanation_en?: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id?: string;
  session_id: string;
  score: number;
  total_questions: number;
  answers: QuizAnswerRecord[];
  started_at: string;
  completed_at?: string;
}

export interface QuizAnswerRecord {
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
}

// For CSV upload
export interface QuizQuestionCSVRow {
  order: string | number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: string | number;
  explanation: string;
}

// Quiz with questions for display
export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

// Quiz result for display
export interface QuizResult {
  quiz: Quiz;
  attempt: QuizAttempt;
  questions: QuizQuestion[];
}
