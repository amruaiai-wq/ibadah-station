'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapNew from '@/components/journey/JourneyMapNew';
import StepPopup from '@/components/journey/StepPopup';

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

export default function NajisTypesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('najisTypes');
  const tCommon = useTranslations('common');

  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const steps: Step[] = t.raw('steps') as Step[];

  const handleStepClick = (step: Step, index: number) => {
    setSelectedStep(step);
    setSelectedIndex(index);
    setIsPopupOpen(true);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedStep(steps[newIndex]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < steps.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedStep(steps[newIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 text-white py-16 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
          >
            <motion.span animate={{ x: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
            <span>{tCommon('buttons.back')}</span>
          </Link>

          <div className="text-center">
            <motion.span className="text-6xl mb-4 block" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              ⚠️
            </motion.span>
            <motion.h1 className="text-4xl md:text-5xl font-bold mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {t('title')}
            </motion.h1>
            <motion.p className="text-3xl font-arabic text-gold mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {t('titleArabic')}
            </motion.p>
            <motion.p className="text-lg text-white/80 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {t('description')}
            </motion.p>

            <motion.div className="flex justify-center gap-8 mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">{steps.length}</p>
                <p className="text-white/60 text-sm">{locale === 'th' ? 'ประเภท' : 'Types'}</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#FDF8F3"/>
          </svg>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <JourneyMapNew steps={steps} journeyIcon="⚠️" journeyColor="orange" onStepClick={handleStepClick} locale={locale} />
        </div>
      </section>

      <StepPopup
        step={selectedStep}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={selectedIndex > 0}
        canGoNext={selectedIndex < steps.length - 1}
        currentIndex={selectedIndex}
        totalSteps={steps.length}
        locale={locale}
        journeyType="najis-types"
      />
    </div>
  );
}
