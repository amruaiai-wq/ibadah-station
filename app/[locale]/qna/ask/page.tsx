'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import QuestionForm from '@/components/qna/QuestionForm';

export default function AskQuestionPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('qna');
  const { user, loading } = useAuth();

  const formTranslations = {
    title: t('form.title'),
    titlePlaceholder: t('form.titlePlaceholder'),
    content: t('form.content'),
    contentPlaceholder: t('form.contentPlaceholder'),
    category: t('form.category'),
    selectCategory: t('form.selectCategory'),
    submit: t('form.submit'),
    submitting: t('form.submitting'),
    success: t('form.success'),
    successMessage: t('form.successMessage'),
    loginRequired: t('loginToAsk'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <span className="text-6xl block mb-4">🔐</span>
          <h1 className="text-2xl font-bold text-dark mb-4">
            {locale === 'th' ? 'กรุณาเข้าสู่ระบบ' : 'Please Login'}
          </h1>
          <p className="text-gray-600 mb-6">{t('loginToAsk')}</p>
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
          >
            {locale === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-emerald-900 text-white py-12 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href={`/${locale}/qna`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>{locale === 'th' ? 'กลับหน้าถาม-ตอบ' : 'Back to Q&A'}</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('askQuestion')}</h1>
            <p className="text-lg text-white/80">{t('description')}</p>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L60 35C120 30 240 20 360 15C480 10 600 10 720 15C840 20 960 30 1080 30C1200 30 1320 20 1380 15L1440 10V40H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <QuestionForm locale={locale} translations={formTranslations} />
        </div>
      </section>
    </div>
  );
}
