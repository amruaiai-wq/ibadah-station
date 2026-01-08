'use client';

import { motion } from 'framer-motion';
import type { Answer } from '@/lib/qna-types';

interface AnswerCardProps {
  answer: Answer;
  locale: string;
  translations: {
    by: string;
    sources: string;
  };
}

export default function AnswerCard({ answer, locale, translations: t }: AnswerCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6"
    >
      {/* Admin Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
          {answer.admin?.name?.charAt(0) || 'A'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-dark">{answer.admin?.name || 'Admin'}</span>
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
              {locale === 'th' ? 'ผู้ตอบ' : 'Expert'}
            </span>
          </div>
          <span className="text-sm text-gray-500">{formatDate(answer.created_at)}</span>
        </div>
      </div>

      {/* Answer Content */}
      <div className="prose prose-green max-w-none mb-4">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {answer.content}
        </p>
      </div>

      {/* Sources */}
      {answer.sources && answer.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            📚 {t.sources}:
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {answer.sources.map((source, index) => (
              <li key={index}>{source}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
