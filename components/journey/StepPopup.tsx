'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostcardModal from '@/components/ui/PostcardModal';
import { StepData } from '@/lib/pdfExport';

interface Step {
  id: number;
  title: string;
  titleArabic: string;
  description: string;
  details: string[];
  tips?: string;
  icon: string;
  dua?: {
    arabic: string;
    transliteration: string;
    meaning: string;
  };
}

interface StepPopupProps {
  step: Step | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentIndex: number;
  totalSteps: number;
  locale: string;
  journeyType?: string;
}

export default function StepPopup({
  step,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  currentIndex,
  totalSteps,
  locale,
  journeyType = 'salah'
}: StepPopupProps) {
  const [isPostcardOpen, setIsPostcardOpen] = useState(false);

  if (!step) return null;

  const texts = {
    th: {
      previous: 'ก่อนหน้า',
      next: 'ถัดไป',
      close: 'ปิด',
      tips: 'เคล็ดลับ',
      dua: 'ดุอา/หลักฐาน',
      transliteration: 'คำอ่าน',
      meaning: 'ความหมาย',
      step: 'ขั้นตอนที่',
      createPostcard: 'สร้าง Postcard',
    },
    en: {
      previous: 'Previous',
      next: 'Next',
      close: 'Close',
      tips: 'Tips',
      dua: 'Dua/Evidence',
      transliteration: 'Transliteration',
      meaning: 'Meaning',
      step: 'Step',
      createPostcard: 'Create Postcard',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  const postcardData: StepData = {
    title: step.title,
    titleArabic: step.titleArabic,
    description: step.description,
    icon: step.icon,
    stepNumber: currentIndex + 1,
    totalSteps: totalSteps,
    dua: step.dua,
  };

  // Progress percentage
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 z-50"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[80vh]">
                {/* Header - Compact */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white px-5 pt-5 pb-4 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15L15 0zm0 5L5 15l10 10 10-10-10-10z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
                      }}
                    />
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="relative z-10">
                    {/* Step Counter & Icon */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-lg">
                        {step.icon}
                      </div>
                      <div>
                        <span className="text-emerald-200 text-xs font-medium tracking-wide">
                          {t.step} {currentIndex + 1} / {totalSteps}
                        </span>
                        {/* Progress Bar */}
                        <div className="w-24 h-1.5 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-amber-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold leading-tight mb-1">{step.title}</h2>
                    <p className="text-lg font-arabic text-amber-300/90">{step.titleArabic}</p>

                    {/* Postcard Button - Inline */}
                    <button
                      onClick={() => setIsPostcardOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-full
                               hover:bg-white/25 transition-all text-xs font-medium backdrop-blur-sm border border-white/20"
                    >
                      <span>🎴</span>
                      <span>{t.createPostcard}</span>
                    </button>
                  </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-gray-50 to-white">
                  {/* Description */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Details - Compact List */}
                  <div className="space-y-2 mb-4">
                    {step.details.map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2.5 group"
                      >
                        <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 text-sm leading-relaxed">{detail}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Dua Section - Compact Card */}
                  {step.dua && (
                    <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl p-4 mb-4 border border-emerald-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-emerald-600/10 rounded-lg flex items-center justify-center text-sm">📖</span>
                        <h3 className="font-semibold text-emerald-800 text-sm">{t.dua}</h3>
                      </div>

                      {/* Arabic Text */}
                      <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-emerald-100">
                        <p className="text-lg font-arabic text-right leading-loose text-gray-800">
                          {step.dua.arabic}
                        </p>
                      </div>

                      {/* Transliteration & Meaning */}
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-emerald-700 font-medium text-xs">{t.transliteration}:</span>
                          <p className="text-gray-600 italic mt-0.5">{step.dua.transliteration}</p>
                        </div>
                        <div>
                          <span className="text-emerald-700 font-medium text-xs">{t.meaning}:</span>
                          <p className="text-gray-600 mt-0.5">{step.dua.meaning}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips - Compact */}
                  {step.tips && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 bg-amber-400/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">💡</span>
                        <div>
                          <h3 className="font-semibold text-amber-800 text-sm mb-1">{t.tips}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{step.tips}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Navigation - Clean */}
                <div className="px-5 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className={`
                      flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium transition-all text-sm
                      ${!canGoPrevious
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'}
                    `}
                  >
                    <span>←</span>
                    <span>{t.previous}</span>
                  </button>

                  <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`
                      flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium transition-all text-sm
                      ${!canGoNext
                        ? 'bg-amber-100 text-amber-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-200 active:scale-95'}
                    `}
                  >
                    <span>{t.next}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Postcard Modal */}
      <PostcardModal
        isOpen={isPostcardOpen}
        onClose={() => setIsPostcardOpen(false)}
        type="step"
        data={postcardData}
        locale={locale}
        journeyType={journeyType}
      />
    </>
  );
}
