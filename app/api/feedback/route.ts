import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { CreateFeedbackInput, ContentFeedback, FeedbackFilters, FeedbackStatus, PageType } from '@/lib/feedback-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ======================================
// POST /api/feedback - Submit new feedback
// ======================================
export async function POST(request: NextRequest) {
  try {
    const body: CreateFeedbackInput = await request.json();

    // Validate required fields
    if (!body.page_type || !body.page_path || !body.category_slug || !body.subject || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user session (optional - allows anonymous feedback)
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Get category ID from slug
    const { data: category } = await supabase
      .from('feedback_categories')
      .select('id')
      .eq('slug', body.category_slug)
      .single();

    // Get user agent
    const userAgent = request.headers.get('user-agent') || undefined;

    // Insert feedback
    const { data, error } = await supabase
      .from('content_feedback')
      .insert({
        user_id: userId,
        user_email: body.user_email,
        page_type: body.page_type,
        page_path: body.page_path,
        page_title: body.page_title,
        content_id: body.content_id,
        content_excerpt: body.content_excerpt,
        category_id: category?.id,
        category_slug: body.category_slug,
        subject: body.subject,
        description: body.description,
        suggested_correction: body.suggested_correction,
        user_agent: userAgent,
        locale: body.locale,
        screenshot_url: body.screenshot_url,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    // TODO: Send LINE notification to admin about new feedback
    // await sendLineNotificationToAdmin(data);

    return NextResponse.json({
      success: true,
      data,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ======================================
// GET /api/feedback - List feedback (admin only)
// ======================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse filters
    const filters: FeedbackFilters = {
      status: (searchParams.get('status') as FeedbackStatus) || undefined,
      page_type: (searchParams.get('page_type') as PageType) || undefined,
      category_slug: searchParams.get('category_slug') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Build query
    let query = supabase
      .from('content_feedback')
      .select(`
        *,
        category:feedback_categories(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.page_type) {
      query = query.eq('page_type', filters.page_type);
    }
    if (filters.category_slug) {
      query = query.eq('category_slug', filters.category_slug);
    }
    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data as ContentFeedback[],
      total: count || 0,
      limit: filters.limit,
      offset: filters.offset,
    });

  } catch (error) {
    console.error('Error in GET /api/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
