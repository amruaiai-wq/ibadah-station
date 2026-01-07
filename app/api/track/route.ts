import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { path, referrer } = await request.json();
    
    // Get user agent and IP
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    
    // Generate or get session ID
    const sessionId = request.cookies.get('session_id')?.value || 
                      crypto.randomBytes(16).toString('hex');
    
    // Insert page view only if Supabase is configured
    if (supabase) {
      await supabase.from('page_views').insert({
        page_path: path,
        user_agent: userAgent,
        ip_hash: ipHash,
        referrer: referrer,
        session_id: sessionId,
      });
    }
    
    const response = NextResponse.json({ success: true });
    
    // Set session cookie if not exists
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
