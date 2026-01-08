'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import AnswerCard from '@/components/qna/AnswerCard';
import type { QuestionWithDetails } from '@/lib/qna-types';

export default function QuestionDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = useTranslations('qna');

  const [question, setQuestion] = useState<QuestionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/qna/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.question) {
          setQuestion(data.question);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => {
        setError('Failed to load question');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    answered: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-cream py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <span className="text-6xl block mb-4">😕</span>
          <h1 className="text-2xl font-bold text-dark mb-4">
            {locale === 'th' ? 'ไม่พบคำถาม' : 'Question Not Found'}
          </h1>
          <Link
            href={`/${locale}/qna`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
          >
            {locale === 'th' ? 'กลับหน้าถาม-ตอบ' : 'Back to Q&A'}
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href={`/${locale}/qna`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>{locale === 'th' ? 'กลับหน้าถาม-ตอบ' : 'Back to Q&A'}</span>
          </Link>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L60 35C120 30 240 20 360 15C480 10 600 10 720 15C840 20 960 30 1080 30C1200 30 1320 20 1380 15L1440 10V40H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                {question.category?.icon || '❓'}
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[question.status]}`}>
                    {t(`status.${question.status}`)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {locale === 'th' ? question.category?.name_th : question.category?.name_en}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark">
                  {question.title}
                </h1>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              {question.user && (
                <div className="flex items-center gap-2">
                  {question.user.avatar_url ? (
                    <img
                      src={question.user.avatar_url}
                      alt={question.user.display_name || ''}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                      {question.user.display_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <span>{question.user.display_name}</span>
                </div>
              )}
              <span>{formatDate(question.created_at)}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {question.view_count}
              </span>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                {question.content}
              </p>
            </div>
          </motion.div>

          {/* Answers Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <span className="text-2xl">💬</span>
              {t('answer.title')}
              {question.answers && question.answers.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({question.answers.length})
                </span>
              )}
            </h2>

            {question.answers && question.answers.length > 0 ? (
              question.answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  locale={locale}
                  translations={{
                    by: t('answer.by'),
                    sources: t('answer.sources'),
                  }}
                />
              ))
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <span className="text-4xl block mb-3">⏳</span>
                <p className="text-yellow-800 font-medium">{t('answer.noAnswer')}</p>
                <p className="text-yellow-600 text-sm mt-1">
                  {locale === 'th' ? 'คำถามของคุณกำลังรอการตอบจากผู้รู้' : 'Your question is awaiting an expert response'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
