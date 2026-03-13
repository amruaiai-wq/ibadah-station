'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import FeedbackModal from './FeedbackModal';
import type { PageType } from '@/lib/feedback-types';

interface FeedbackButtonProps {
  pageType: PageType;
  pagePath: string;
  pageTitle?: string;
  contentId?: string;
  contentExcerpt?: string;
  className?: string;
  variant?: 'floating' | 'inline';
}

export default function FeedbackButton({
  pageType,
  pagePath,
  pageTitle,
  contentId,
  contentExcerpt,
  className = '',
  variant = 'floating',
}: FeedbackButtonProps) {
  const t = useTranslations('feedback');
  const locale = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonClasses = variant === 'floating'
    ? `fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 z-40 ${className}`
    : `inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors ${className}`;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={buttonClasses}
        title={t('reportButton')}
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-semibold">{t('reportButton')}</span>
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pageType={pageType}
        pagePath={pagePath}
        pageTitle={pageTitle}
        contentId={contentId}
        contentExcerpt={contentExcerpt}
        locale={locale}
      />
    </>
  );
}
