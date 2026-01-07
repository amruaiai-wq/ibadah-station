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
      dua: 'ดุอา',
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
      dua: 'Dua',
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
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                        {step.icon}
                      </span>
                      <div>
                        <p className="text-gold text-sm mb-1">
                          {t.step} {currentIndex + 1} / {totalSteps}
                        </p>
                        <h2 className="text-2xl font-bold">{step.title}</h2>
                        <p className="text-xl font-arabic text-gold/90 mt-1">
                          {step.titleArabic}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Export Button */}
                  <button
                    onClick={() => setIsPostcardOpen(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full 
                             hover:bg-white/30 transition-colors text-sm font-medium"
                  >
                    <span>🎴</span>
                    <span>{t.createPostcard}</span>
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Description */}
                  <p className="text-gray-700 text-lg mb-6">
                    {step.description}
                  </p>

                  {/* Details */}
                  <div className="mb-6">
                    <ul className="space-y-3">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dua Section */}
                  {step.dua && (
                    <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-5 mb-6 border border-gold/20">
                      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <span>📖</span>
                        <span>{t.dua}</span>
                      </h3>
                      
                      {/* Arabic */}
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <p className="text-2xl font-arabic text-right leading-loose text-gray-800">
                          {step.dua.arabic}
                        </p>
                      </div>

                      {/* Transliteration */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">{t.transliteration}:</p>
                        <p className="text-gray-700 italic">
                          {step.dua.transliteration}
                        </p>
                      </div>

                      {/* Meaning */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t.meaning}:</p>
                        <p className="text-gray-700">
                          {step.dua.meaning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {step.tips && (
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                        <span>💡</span>
                        <span>{t.tips}</span>
                      </h3>
                      <p className="text-blue-700">
                        {step.tips}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="border-t border-gray-100 p-4 flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50">
                  <button
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
                      ${!canGoPrevious
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    `}
                  >
                    <span>←</span>
                    <span>{t.previous}</span>
                  </button>

                  <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
                      ${!canGoNext
                        ? 'bg-gold/50 text-dark/50 cursor-not-allowed'
                        : 'bg-gold text-dark hover:bg-gold-dark'}
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
