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

// POST - Submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { answers, session_id } = body;

    // Get quiz questions with correct answers
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id)
      .order('order_number');

    if (questionsError) throw questionsError;

    // Calculate score
    let score = 0;
    const answerRecords = questions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_answer;
      if (isCorrect) score++;

      return {
        question_id: question.id,
        selected_answer: userAnswer || null,
        is_correct: isCorrect,
      };
    });

    // Save attempt
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        quiz_id: id,
        session_id: session_id || 'anonymous',
        score,
        total_questions: questions.length,
        answers: answerRecords,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Return result with questions including correct answers and explanations
    return NextResponse.json({
      attempt,
      questions,
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
