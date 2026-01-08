'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Question, QuestionCategory } from '@/lib/qna-types';

interface QuestionCardProps {
  question: Question & { category?: QuestionCategory; answers?: { id: string }[] };
  locale: string;
}

export default function QuestionCard({ question, locale }: QuestionCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    answered: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusText = {
    pending: locale === 'th' ? 'รอคำตอบ' : 'Pending',
    answered: locale === 'th' ? 'ตอบแล้ว' : 'Answered',
    closed: locale === 'th' ? 'ปิดแล้ว' : 'Closed',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/${locale}/qna/${question.id}`}>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
          <div className="flex items-start gap-4">
            {/* Category Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
              {question.category?.icon || '❓'}
            </div>

            <div className="flex-grow min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-dark text-lg mb-2 line-clamp-2">
                {question.title}
              </h3>

              {/* Content Preview */}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {question.content}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {/* Status */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[question.status]}`}>
                  {statusText[question.status]}
                </span>

                {/* Category */}
                <span className="text-gray-500">
                  {locale === 'th' ? question.category?.name_th : question.category?.name_en}
                </span>

                {/* Date */}
                <span className="text-gray-400">
                  {formatDate(question.created_at)}
                </span>

                {/* View Count */}
                <span className="text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {question.view_count}
                </span>

                {/* Answer Count */}
                {question.answers && question.answers.length > 0 && (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {question.answers.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
