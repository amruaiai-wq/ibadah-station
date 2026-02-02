'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import LineConnectionCard from '@/components/notifications/LineConnectionCard';
import NotificationPreferencesForm from '@/components/notifications/NotificationPreferencesForm';

const texts = {
  th: {
    title: 'ตั้งค่าการแจ้งเตือน LINE',
    subtitle: 'รับการแจ้งเตือนเวลาละหมาด อัซการ ข้อคิดประจำวัน และการอ่านอัลกุรอาน',
    back: 'กลับ',
    loginRequired: 'กรุณาเข้าสู่ระบบ',
    loginDescription: 'เข้าสู่ระบบเพื่อตั้งค่าการแจ้งเตือน LINE',
    loginButton: 'เข้าสู่ระบบ',
  },
  en: {
    title: 'LINE Notification Settings',
    subtitle: 'Receive prayer time, adhkar, daily wisdom, and Quran reading reminders',
    back: 'Back',
    loginRequired: 'Login Required',
    loginDescription: 'Please login to set up LINE notifications',
    loginButton: 'Login',
  },
};

export default function NotificationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'th';
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const t = texts[locale as keyof typeof texts] || texts.th;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-dark mb-2">
                {t.loginRequired}
              </h1>
              <p className="text-gray-600 mb-6">{t.loginDescription}</p>
              <button
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors"
              >
                {t.loginButton}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t.back}
          </button>

          <h1 className="text-3xl font-bold text-dark mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </motion.div>

        {/* LINE Connection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <LineConnectionCard locale={locale} />
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NotificationPreferencesForm locale={locale} />
        </motion.div>
      </div>
    </div>
  );
}
