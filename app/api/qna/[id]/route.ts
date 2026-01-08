import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// GET - Get a single question with answers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { id } = params;

  // Get question with category, user, and answers
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      category:question_categories(*),
      user:user_profiles(id, display_name, avatar_url),
      answers(
        *,
        admin:admin_users(id, name, email)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment view count
  await supabase
    .from('questions')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id);

  return NextResponse.json({ question: data });
}
