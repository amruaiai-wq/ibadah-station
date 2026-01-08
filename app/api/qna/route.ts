import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// GET - List questions
export async function GET(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('questions')
    .select(`
      *,
      category:question_categories(*),
      user:user_profiles(id, display_name, avatar_url),
      answers(id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by status (default: show only answered for public)
  if (status) {
    query = query.eq('status', status);
  }

  // Filter by category
  if (category) {
    query = query.eq('category:question_categories.slug', category);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    questions: data,
    total: count,
    limit,
    offset,
  });
}

// POST - Create a new question
export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  // Verify the user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await request.json();
  const { category_id, title, content } = body;

  if (!category_id || !title || !content) {
    return NextResponse.json(
      { error: 'category_id, title, and content are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      user_id: user.id,
      category_id,
      title,
      content,
      status: 'pending',
    })
    .select(`
      *,
      category:question_categories(*)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ question: data }, { status: 201 });
}
