import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(url, key);
}

// GET - List all quizzes (admin)
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: quizzes, error } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST - Create new quiz with questions
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { quiz, questions } = body;

    // Create quiz
    const { data: newQuiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .insert({
        title_th: quiz.title_th,
        title_en: quiz.title_en,
        description_th: quiz.description_th,
        description_en: quiz.description_en,
        category: quiz.category || 'general',
        difficulty: quiz.difficulty || 'medium',
        time_limit_minutes: quiz.time_limit_minutes,
        is_published: quiz.is_published || false,
        questions_count: questions.length,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    // Insert questions
    if (questions && questions.length > 0) {
      const questionsWithQuizId = questions.map((q: Record<string, unknown>, index: number) => ({
        quiz_id: newQuiz.id,
        order_number: index + 1,
        question_th: q.question_th,
        question_en: q.question_en,
        option_1_th: q.option_1_th,
        option_1_en: q.option_1_en,
        option_2_th: q.option_2_th,
        option_2_en: q.option_2_en,
        option_3_th: q.option_3_th,
        option_3_en: q.option_3_en,
        option_4_th: q.option_4_th,
        option_4_en: q.option_4_en,
        correct_answer: q.correct_answer,
        explanation_th: q.explanation_th,
        explanation_en: q.explanation_en,
      }));

      const { error: questionsError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(questionsWithQuizId);

      if (questionsError) throw questionsError;
    }

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
