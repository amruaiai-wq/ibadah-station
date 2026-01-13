'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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

interface JourneyMapNewProps {
  steps: Step[];
  journeyIcon: string;
  journeyColor?: string;
  onStepClick: (step: Step, index: number) => void;
  locale: string;
}

export default function JourneyMapNew({
  steps,
  journeyIcon,
  journeyColor = 'emerald',
  onStepClick,
  locale,
}: JourneyMapNewProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState<number | null>(null);
  const pathRef = useRef<HTMLDivElement>(null);

  const texts = {
    th: {
      stepLabel: 'ขั้นตอนที่',
      completed: 'สำเร็จ',
      current: 'กำลังเรียน',
      locked: 'รออยู่',
      clickToLearn: 'คลิกเพื่อเรียนรู้',
      markComplete: 'เสร็จสิ้น ไปต่อ',
      progress: 'ความก้าวหน้า',
      congratulations: '🎉 ยินดีด้วย! คุณเรียนจบแล้ว!',
    },
    en: {
      stepLabel: 'Step',
      completed: 'Completed',
      current: 'Learning',
      locked: 'Locked',
      clickToLearn: 'Click to learn',
      markComplete: 'Complete & Continue',
      progress: 'Progress',
      congratulations: '🎉 Congratulations! You completed the journey!',
    }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', glow: 'shadow-emerald-500/50' },
    teal: { bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500', glow: 'shadow-teal-500/50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500/50' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', glow: 'shadow-cyan-500/50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', glow: 'shadow-orange-500/50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', glow: 'shadow-purple-500/50' },
    sky: { bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500', glow: 'shadow-sky-500/50' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', glow: 'shadow-rose-500/50' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', glow: 'shadow-indigo-500/50' },
    red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600', glow: 'shadow-red-600/50' },
    slate: { bg: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-600', glow: 'shadow-slate-600/50' },
  };
  const colors = colorClasses[journeyColor] || colorClasses.emerald;

  const handleStepComplete = (index: number) => {
    if (!completedSteps.includes(index)) {
      const newCompleted = [...completedSteps, index];
      setCompletedSteps(newCompleted);
      
      if (index < steps.length - 1) {
        setCurrentStep(index + 1);
      }

      // Celebration effect
      if (index === steps.length - 1) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#006B3F', '#C5A572', '#0D9488'],
        });
      }
    }
    setShowSummary(null);
  };

  const isStepAccessible = (index: number) => {
    if (index === 0) return true;
    return completedSteps.includes(index - 1);
  };

  const getStepStatus = (index: number) => {
    if (completedSteps.includes(index)) return 'completed';
    if (index === currentStep && isStepAccessible(index)) return 'current';
    if (isStepAccessible(index)) return 'accessible';
    return 'locked';
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-700">{t.progress}</span>
          <span className={`font-bold ${colors.text}`}>
            {completedSteps.length}/{steps.length} ({Math.round(progressPercentage)}%)
          </span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${colors.bg} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        {completedSteps.length === steps.length && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4 text-lg font-bold text-primary"
          >
            {t.congratulations}
          </motion.p>
        )}
      </div>

      {/* Journey Path */}
      <div ref={pathRef} className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2" />
        <motion.div 
          className={`absolute left-8 md:left-1/2 top-0 w-1 ${colors.bg} -translate-x-1/2 origin-top`}
          initial={{ height: 0 }}
          animate={{ height: `${progressPercentage}%` }}
          transition={{ duration: 1 }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
              >
                {/* Step Node */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <motion.button
                    onClick={() => {
                      if (status !== 'locked') {
                        setShowSummary(showSummary === index ? null : index);
                      }
                    }}
                    disabled={status === 'locked'}
                    className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
                      transition-all duration-300 border-4
                      ${status === 'completed' 
                        ? `${colors.bg} border-white text-white shadow-lg ${colors.glow}` 
                        : status === 'current'
                          ? `bg-white ${colors.border} ${colors.text} shadow-lg ${colors.glow} animate-pulse`
                          : status === 'accessible'
                            ? `bg-white border-gray-300 text-gray-400 hover:${colors.border} hover:${colors.text}`
                            : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                      }
                    `}
                    whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
                    whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
                  >
                    {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : step.icon}
                    
                    {/* Pulse ring for current */}
                    {status === 'current' && (
                      <motion.div
                        className={`absolute inset-0 rounded-full border-4 ${colors.border}`}
                        animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                </div>

                {/* Step Card */}
                <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-8 pl-24 md:pl-0' : 'md:pl-8 pl-24'}`}>
                  <motion.div
                    className={`
                      bg-white rounded-2xl p-5 shadow-md border-2 transition-all duration-300
                      ${status === 'current' ? `${colors.border} shadow-lg` : 'border-transparent'}
                      ${status === 'locked' ? 'opacity-50' : 'hover:shadow-lg cursor-pointer'}
                    `}
                    onClick={() => {
                      if (status !== 'locked') {
                        setShowSummary(showSummary === index ? null : index);
                      }
                    }}
                    whileHover={status !== 'locked' ? { y: -4 } : {}}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full
                        ${status === 'completed' ? 'bg-green-100 text-green-700' :
                          status === 'current' ? `${colors.bg} text-white` :
                          'bg-gray-100 text-gray-500'}`}
                      >
                        {t.stepLabel} {index + 1}
                      </span>
                      <span className={`text-xs
                        ${status === 'completed' ? 'text-green-600' :
                          status === 'current' ? colors.text :
                          'text-gray-400'}`}
                      >
                        {status === 'completed' ? `✓ ${t.completed}` :
                         status === 'current' ? `● ${t.current}` :
                         status === 'accessible' ? t.clickToLearn :
                         `🔒 ${t.locked}`}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                    <p className="text-gold font-arabic text-lg mb-2">{step.titleArabic}</p>
                    
                    {/* Description Preview */}
                    <p className="text-gray-600 text-sm line-clamp-2">{step.description}</p>
                  </motion.div>

                  {/* Expanded Summary */}
                  <AnimatePresence>
                    {showSummary === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`mt-3 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border-2 ${colors.border}`}>
                          {/* Quick Details */}
                          <div className="space-y-2 mb-4">
                            {step.details.slice(0, 3).map((detail, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className={`w-5 h-5 ${colors.bg} text-white rounded-full flex items-center justify-center text-xs flex-shrink-0`}>
                                  {i + 1}
                                </span>
                                <span className="text-gray-700 text-sm">{detail}</span>
                              </div>
                            ))}
                          </div>

                          {/* Dua Preview */}
                          {step.dua && (
                            <div className="bg-white rounded-xl p-3 mb-4 border border-gray-100">
                              <p className="text-right font-arabic text-lg text-gray-800 mb-1">
                                {step.dua.arabic}
                              </p>
                              <p className="text-xs text-gray-500 italic">{step.dua.transliteration}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStepClick(step, index);
                              }}
                              className={`flex-1 py-3 ${colors.bg} text-white rounded-xl font-semibold hover:opacity-90 transition-all`}
                            >
                              {locale === 'th' ? '📖 เรียนรู้เพิ่มเติม' : '📖 Learn More'}
                            </button>
                            {status === 'current' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStepComplete(index);
                                }}
                                className="flex-1 py-3 bg-gold text-dark rounded-xl font-semibold hover:bg-gold-dark transition-all"
                              >
                                ✓ {t.markComplete}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            );
          })}
        </div>

        {/* Journey End */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative flex justify-center mt-8"
        >
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center text-3xl
            ${completedSteps.length === steps.length 
              ? `${colors.bg} text-white shadow-xl ${colors.glow}` 
              : 'bg-gray-100 text-gray-300'}
          `}>
            {completedSteps.length === steps.length ? '🏆' : journeyIcon}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
