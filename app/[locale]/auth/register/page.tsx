'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth');

  const translations = {
    title: t('register.title'),
    name: t('register.name'),
    email: t('register.email'),
    password: t('register.password'),
    confirmPassword: t('register.confirmPassword'),
    register: t('register.submit'),
    hasAccount: t('register.hasAccount'),
    login: t('register.login'),
    orContinueWith: t('register.orContinueWith'),
    passwordMismatch: t('register.passwordMismatch'),
    success: t('register.success'),
    checkEmail: t('register.checkEmail'),
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

        <RegisterForm locale={locale} translations={translations} />
      </div>
    </div>
  );
}
