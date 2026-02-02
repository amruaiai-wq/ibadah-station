'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface LineConnection {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  connectedAt: string;
}

interface LineConnectionCardProps {
  locale: string;
}

const texts = {
  th: {
    title: 'เชื่อมต่อ LINE',
    description: 'เชื่อมต่อ LINE เพื่อรับการแจ้งเตือน',
    connected: 'เชื่อมต่อแล้ว',
    notConnected: 'ยังไม่ได้เชื่อมต่อ',
    connectedAs: 'เชื่อมต่อในชื่อ',
    connectedSince: 'เชื่อมต่อเมื่อ',
    connectButton: 'เชื่อมต่อ LINE',
    disconnectButton: 'ยกเลิกการเชื่อมต่อ',
    step1: '1. Add Friend LINE Official Account',
    step2: '2. ส่งข้อความ "link" หรือ "ลิงก์"',
    step3: '3. กดลิงก์ที่ได้รับเพื่อเชื่อมต่อบัญชี',
    scanQr: 'สแกน QR Code เพื่อ Add Friend',
    orSearch: 'หรือค้นหา ID',
    loading: 'กำลังโหลด...',
    disconnecting: 'กำลังยกเลิก...',
    error: 'เกิดข้อผิดพลาด',
    loginRequired: 'กรุณาเข้าสู่ระบบก่อน',
  },
  en: {
    title: 'Connect LINE',
    description: 'Connect your LINE account to receive notifications',
    connected: 'Connected',
    notConnected: 'Not connected',
    connectedAs: 'Connected as',
    connectedSince: 'Connected since',
    connectButton: 'Connect LINE',
    disconnectButton: 'Disconnect',
    step1: '1. Add Friend LINE Official Account',
    step2: '2. Send message "link"',
    step3: '3. Click the link to connect your account',
    scanQr: 'Scan QR Code to Add Friend',
    orSearch: 'or search ID',
    loading: 'Loading...',
    disconnecting: 'Disconnecting...',
    error: 'An error occurred',
    loginRequired: 'Please login first',
  },
};

// Replace with your actual LINE Official Account ID
const LINE_OA_ID = '@ibadahstation';

export default function LineConnectionCard({ locale }: LineConnectionCardProps) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<LineConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = texts[locale as keyof typeof texts] || texts.th;

  useEffect(() => {
    if (user) {
      fetchConnectionStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();

      if (!sessionData?.access_token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/line/link', {
        headers: {
          Authorization: `Bearer ${sessionData.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connection status');
      }

      const data = await response.json();

      if (data.connected) {
        setConnection(data.connection);
      } else {
        setConnection(null);
      }
    } catch (err) {
      console.error('Error fetching connection status:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      setError(null);

      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();

      if (!sessionData?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/line/unlink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setConnection(null);
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError(t.error);
    } finally {
      setDisconnecting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-dark mb-4">{t.title}</h3>
        <p className="text-gray-500">{t.loginRequired}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-dark mb-4">{t.title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-dark">{t.title}</h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            connection
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {connection ? t.connected : t.notConnected}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {connection ? (
        // Connected state
        <div>
          <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 rounded-xl">
            {connection.pictureUrl ? (
              <img
                src={connection.pictureUrl}
                alt={connection.displayName || 'LINE Profile'}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">{t.connectedAs}</p>
              <p className="text-lg font-semibold text-dark">
                {connection.displayName || 'LINE User'}
              </p>
              <p className="text-xs text-gray-400">
                {t.connectedSince}{' '}
                {new Date(connection.connectedAt).toLocaleDateString(
                  locale === 'th' ? 'th-TH' : 'en-US'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {disconnecting ? t.disconnecting : t.disconnectButton}
          </button>
        </div>
      ) : (
        // Not connected state
        <div>
          <p className="text-gray-600 mb-6">{t.description}</p>

          {/* QR Code placeholder - Replace with actual QR code */}
          <div className="flex flex-col items-center mb-6 p-6 bg-gray-50 rounded-xl">
            <div className="w-40 h-40 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
              {/* LINE Logo/QR placeholder */}
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-green-500 mb-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.271 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.348 14.055 24 12.293 24 10.304z" />
                </svg>
                <p className="text-xs text-gray-500">{t.scanQr}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {t.orSearch}: <span className="font-mono font-bold text-green-600">{LINE_OA_ID}</span>
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 font-bold">1</span>
              <p className="text-sm text-gray-700">{t.step1}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 font-bold">2</span>
              <p className="text-sm text-gray-700">{t.step2}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 font-bold">3</span>
              <p className="text-sm text-gray-700">{t.step3}</p>
            </div>
          </div>

          {/* Add Friend button */}
          <a
            href={`https://line.me/R/ti/p/${LINE_OA_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.271 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.348 14.055 24 12.293 24 10.304z" />
            </svg>
            {t.connectButton}
          </a>
        </div>
      )}
    </motion.div>
  );
}
