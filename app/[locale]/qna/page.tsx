'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import QuestionCard from '@/components/qna/QuestionCard';
import CategoryFilter from '@/components/qna/CategoryFilter';
import type { Question, QuestionCategory } from '@/lib/qna-types';

export default function QnAPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('qna');
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/qna?${params.toString()}`);
      const data = await response.json();

      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, statusFilter]);

  useEffect(() => {
    // Fetch categories
    fetch('/api/qna/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories);
        }
      });

    // Fetch questions
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-emerald-900 text-white py-16 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>{locale === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}</span>
          </Link>

          <div className="text-center">
            <motion.span
              className="text-6xl mb-4 block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              ❓
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('title')}</h1>
            <p className="text-2xl font-arabic text-gold mb-4">{t('titleArabic')}</p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">{t('description')}</p>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            {/* Ask Question Button */}
            {user ? (
              <Link
                href={`/${locale}/qna/ask`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('askQuestion')}
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-dark font-semibold rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('loginToAsk')}
              </Link>
            )}

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'answered', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status === 'all' && t('allQuestions')}
                  {status === 'answered' && t('answeredQuestions')}
                  {status === 'pending' && t('pendingQuestions')}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              locale={locale}
              allLabel={t('allQuestions')}
            />
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-grow">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🤔</span>
              <h3 className="text-xl font-bold text-gray-700 mb-2">{t('noQuestions')}</h3>
              <p className="text-gray-500">{t('askFirst')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
