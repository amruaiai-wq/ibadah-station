/**
 * Auth Session API
 * ดึง access token ของ user ที่ login อยู่
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Get cookies
    const cookieStore = cookies();

    // Try to get session from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    // Also check for Supabase auth cookie (newer format)
    const supabaseAuthCookie = cookieStore.get(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`)?.value;

    if (supabaseAuthCookie) {
      try {
        const parsed = JSON.parse(supabaseAuthCookie);
        if (parsed.access_token) {
          return NextResponse.json({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });
        }
      } catch {
        // Ignore parse error
      }
    }

    if (accessToken) {
      return NextResponse.json({
        access_token: accessToken,
        refresh_token: refreshToken || null,
      });
    }

    // Try to get from authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Verify the token
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        return NextResponse.json({
          access_token: token,
        });
      }
    }

    return NextResponse.json({
      access_token: null,
      refresh_token: null,
    });
  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json({
      access_token: null,
      refresh_token: null,
    });
  }
}
