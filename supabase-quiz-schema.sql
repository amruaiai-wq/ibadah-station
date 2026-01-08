-- Quiz System Schema for Ibadah Station
-- Run this in your Supabase SQL Editor

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_th TEXT,
  description_en TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('salah', 'wudu', 'umrah', 'hajj', 'zakat', 'sawm', 'adhkar', 'general')),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  questions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  question_th TEXT NOT NULL,
  question_en TEXT NOT NULL,
  option_1_th TEXT NOT NULL,
  option_1_en TEXT NOT NULL,
  option_2_th TEXT NOT NULL,
  option_2_en TEXT NOT NULL,
  option_3_th TEXT NOT NULL,
  option_3_en TEXT NOT NULL,
  option_4_th TEXT NOT NULL,
  option_4_en TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 1 AND 4),
  explanation_th TEXT,
  explanation_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, order_number)
);

-- Create quiz_attempts table to track user attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_id ON quiz_attempts(session_id);

-- Update trigger for quizzes
CREATE OR REPLACE FUNCTION update_quiz_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quiz_timestamp ON quizzes;
CREATE TRIGGER trigger_update_quiz_timestamp
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_timestamp();

-- Function to update questions_count
CREATE OR REPLACE FUNCTION update_quiz_questions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quizzes SET questions_count = (
      SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = NEW.quiz_id
    ) WHERE id = NEW.quiz_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quizzes SET questions_count = (
      SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = OLD.quiz_id
    ) WHERE id = OLD.quiz_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_questions_count ON quiz_questions;
CREATE TRIGGER trigger_update_questions_count
  AFTER INSERT OR DELETE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_questions_count();

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes (public can read published)
CREATE POLICY "Public can view published quizzes" ON quizzes
  FOR SELECT USING (is_published = true);

CREATE POLICY "Service role can manage quizzes" ON quizzes
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for quiz_questions (public can read questions of published quizzes)
CREATE POLICY "Public can view questions of published quizzes" ON quiz_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id AND is_published = true)
  );

CREATE POLICY "Service role can manage quiz_questions" ON quiz_questions
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for quiz_attempts (anyone can insert, users can view their own)
CREATE POLICY "Anyone can create quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own attempts" ON quiz_attempts
  FOR SELECT USING (
    session_id = current_setting('app.session_id', true)
    OR user_id = auth.uid()
  );

CREATE POLICY "Service role can manage quiz_attempts" ON quiz_attempts
  FOR ALL USING (auth.role() = 'service_role');
