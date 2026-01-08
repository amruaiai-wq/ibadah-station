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

// GET - Get published quiz with questions (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;

    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (quizError) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, quiz_id, order_number, question_th, question_en, option_1_th, option_1_en, option_2_th, option_2_en, option_3_th, option_3_en, option_4_th, option_4_en')
      .eq('quiz_id', id)
      .order('order_number');

    if (questionsError) throw questionsError;

    // Don't send correct_answer and explanation to client during quiz
    return NextResponse.json({ ...quiz, questions });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}
