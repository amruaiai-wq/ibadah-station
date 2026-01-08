'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth');

  const translations = {
    title: t('login.title'),
    email: t('login.email'),
    password: t('login.password'),
    login: t('login.submit'),
    forgotPassword: t('login.forgotPassword'),
    noAccount: t('login.noAccount'),
    register: t('login.register'),
    orContinueWith: t('login.orContinueWith'),
    loginWithGoogle: t('login.loginWithGoogle'),
    loginWithFacebook: t('login.loginWithFacebook'),
    error: t('login.error'),
    success: t('login.success'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-emerald-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back to Home */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <span>←</span>
          <span>{locale === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🕌</span>
          <h1 className="text-2xl font-bold text-white mt-2">
            <span>ibadah</span>
            <span className="text-gold">station</span>
          </h1>
        </div>

        <LoginForm locale={locale} translations={translations} />
      </div>
    </div>
  );
}
