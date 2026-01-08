import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// POST - Create an answer (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const questionId = params.id;

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

  // Check if user is admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Check if question exists
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const body = await request.json();
  const { content, sources } = body;

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // Create answer
  const { data, error } = await supabase
    .from('answers')
    .insert({
      question_id: questionId,
      admin_id: adminUser.id,
      content,
      sources: sources || [],
    })
    .select(`
      *,
      admin:admin_users(id, name, email)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ answer: data }, { status: 201 });
}
