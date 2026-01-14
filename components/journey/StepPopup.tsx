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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:h-auto md:max-h-[85vh] md:-translate-x-1/2 md:-translate-y-1/2 z-50 flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="bg-cream rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full border border-gold/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5 flex-shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-3xl bg-gold/30 rounded-xl w-14 h-14 flex items-center justify-center flex-shrink-0 border border-gold/40">
                        {step.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-gold-light text-xs font-medium mb-1">
                          {t.step} {currentIndex + 1} / {totalSteps}
                        </p>
                        <h2 className="text-xl font-bold leading-tight">{step.title}</h2>
                        <p className="text-lg font-arabic text-gold-light mt-0.5 truncate">
                          {step.titleArabic}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={() => setIsPostcardOpen(true)}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full
                             hover:bg-gold/30 transition-colors text-sm font-medium border border-gold/30"
                  >
                    <span>🎴</span>
                    <span>{t.createPostcard}</span>
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                  {/* Description */}
                  <p className="text-dark/80 text-base mb-5 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details */}
                  <div className="mb-5">
                    <ul className="space-y-2.5">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-dark/80 text-sm leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dua Section */}
                  {step.dua && (
                    <div className="bg-gradient-to-br from-primary/5 to-gold/10 rounded-xl p-4 mb-5 border border-gold/30">
                      <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-sm">
                        <span className="w-7 h-7 bg-gold/20 rounded-full flex items-center justify-center">📖</span>
                        <span>{t.dua}</span>
                      </h3>

                      {/* Arabic */}
                      <div className="bg-white/80 rounded-lg p-4 mb-3 border border-gold/20">
                        <p className="text-xl font-arabic text-right leading-loose text-dark">
                          {step.dua.arabic}
                        </p>
                      </div>

                      {/* Transliteration */}
                      <div className="mb-2.5">
                        <p className="text-xs text-primary/70 font-medium mb-1">{t.transliteration}:</p>
                        <p className="text-dark/70 italic text-sm">
                          {step.dua.transliteration}
                        </p>
                      </div>

                      {/* Meaning */}
                      <div>
                        <p className="text-xs text-primary/70 font-medium mb-1">{t.meaning}:</p>
                        <p className="text-dark/70 text-sm">
                          {step.dua.meaning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {step.tips && (
                    <div className="bg-gold/10 rounded-xl p-4 border border-gold/30">
                      <h3 className="font-bold text-primary mb-2 flex items-center gap-2 text-sm">
                        <span className="w-7 h-7 bg-gold/30 rounded-full flex items-center justify-center">💡</span>
                        <span>{t.tips}</span>
                      </h3>
                      <p className="text-dark/70 text-sm leading-relaxed">
                        {step.tips}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="border-t border-gold/20 p-4 flex items-center justify-between gap-3 flex-shrink-0 bg-cream">
                  <button
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm
                      ${!canGoPrevious
                        ? 'bg-dark/5 text-dark/30 cursor-not-allowed'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}
                    `}
                  >
                    <span>←</span>
                    <span>{t.previous}</span>
                  </button>

                  <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm
                      ${!canGoNext
                        ? 'bg-gold/30 text-dark/40 cursor-not-allowed'
                        : 'bg-gold text-dark hover:bg-gold-dark shadow-sm'}
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
