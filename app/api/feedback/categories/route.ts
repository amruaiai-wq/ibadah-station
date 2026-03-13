import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { FeedbackCategory } from '@/lib/feedback-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ======================================
// GET /api/feedback/categories - Get all feedback categories
// ======================================
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feedback_categories')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching feedback categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data as FeedbackCategory[],
    });

  } catch (error) {
    console.error('Error in GET /api/feedback/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
