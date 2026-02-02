'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * LIFF Link Page
 * หน้านี้ใช้สำหรับเชื่อมต่อ LINE Account กับ User Account
 * เปิดใน LINE App ผ่าน LIFF
 */

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      login: (config?: { redirectUri?: string }) => void;
      getProfile: () => Promise<LiffProfile>;
      closeWindow: () => void;
      isInClient: () => boolean;
    };
  }
}

function LineLinkContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'login' | 'linking' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [lineProfile, setLineProfile] = useState<LiffProfile | null>(null);

  // Get link token from URL (passed from our website)
  const linkToken = searchParams.get('token');

  useEffect(() => {
    initLiff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initLiff = async () => {
    try {
      // Load LIFF SDK
      if (!window.liff) {
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.async = true;
        script.onload = () => initLiffSdk();
        document.body.appendChild(script);
      } else {
        await initLiffSdk();
      }
    } catch (err) {
      console.error('Failed to load LIFF SDK:', err);
      setStatus('error');
      setError('Failed to load LINE SDK');
    }
  };

  const initLiffSdk = async () => {
    try {
      // Replace with your LIFF ID
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';

      if (!liffId) {
        throw new Error('LIFF ID not configured');
      }

      await window.liff.init({ liffId });

      if (!window.liff.isLoggedIn()) {
        setStatus('login');
        return;
      }

      // Get LINE profile
      const profile = await window.liff.getProfile();
      setLineProfile(profile);

      // If we have a link token, proceed with linking
      if (linkToken) {
        await linkAccount(profile.userId);
      } else {
        // No token, show instructions
        setStatus('login');
      }
    } catch (err) {
      console.error('LIFF init error:', err);
      setStatus('error');
      setError('Failed to initialize LINE');
    }
  };

  const handleLineLogin = () => {
    window.liff.login({
      redirectUri: window.location.href,
    });
  };

  const linkAccount = async (lineUserId: string) => {
    try {
      setStatus('linking');

      const response = await fetch('/api/line/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${linkToken}`,
        },
        body: JSON.stringify({ lineUserId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to link account');
      }

      setStatus('success');

      // Close LIFF window after 3 seconds
      setTimeout(() => {
        if (window.liff.isInClient()) {
          window.liff.closeWindow();
        }
      }, 3000);
    } catch (err) {
      console.error('Link error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to link account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.271 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.348 14.055 24 12.293 24 10.304z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ibadah Station</h1>
          <p className="text-gray-600">เชื่อมต่อบัญชี LINE</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลด...</p>
            </div>
          )}

          {status === 'login' && (
            <div className="text-center py-4">
              {lineProfile ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lineProfile.pictureUrl}
                    alt={lineProfile.displayName}
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                  />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {lineProfile.displayName}
                  </p>
                  <p className="text-gray-600 mb-6">
                    กรุณาเข้าสู่ระบบ Ibadah Station เพื่อเชื่อมต่อบัญชี
                  </p>
                  <a
                    href="/th/auth/login?redirect=/line-link"
                    className="block w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors text-center"
                  >
                    เข้าสู่ระบบ Ibadah Station
                  </a>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    กรุณาเข้าสู่ระบบ LINE เพื่อดำเนินการต่อ
                  </p>
                  <button
                    onClick={handleLineLogin}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.271 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.348 14.055 24 12.293 24 10.304z" />
                    </svg>
                    เข้าสู่ระบบด้วย LINE
                  </button>
                </>
              )}
            </div>
          )}

          {status === 'linking' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังเชื่อมต่อบัญชี...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                เชื่อมต่อสำเร็จ!
              </h2>
              <p className="text-gray-600 mb-4">
                บัญชี LINE ของคุณได้เชื่อมต่อกับ Ibadah Station แล้ว
              </p>
              <p className="text-sm text-gray-500">
                หน้าต่างจะปิดโดยอัตโนมัติ...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Ibadah Station - Islamic Worship Guide</p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.271 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.348 14.055 24 12.293 24 10.304z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ibadah Station</h1>
          <p className="text-gray-600">เชื่อมต่อบัญชี LINE</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LineLinkPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LineLinkContent />
    </Suspense>
  );
}
