'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface JourneyMapProps {
  steps: Step[];
  journeyIcon: string;
  onStepClick: (step: Step) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  locale: string;
}

export default function JourneyMap({ 
  steps, 
  journeyIcon, 
  onStepClick, 
  currentStep,
  setCurrentStep,
  locale
}: JourneyMapProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const getStepPosition = (index: number) => {
    const row = Math.floor(index / 2);
    const isEvenRow = row % 2 === 0;
    const isFirstInRow = index % 2 === 0;

    let x: number;
    if (isEvenRow) {
      x = isFirstInRow ? 25 : 75;
    } else {
      x = isFirstInRow ? 75 : 25;
    }

    const y = 100 + (row * 180) + (isFirstInRow ? 0 : 90);

    return { x, y, isLeft: x < 50 };
  };

  const generatePath = () => {
    let path = '';
    steps.forEach((_, index) => {
      const pos = getStepPosition(index);
      if (index === 0) {
        path += `M ${pos.x} ${pos.y}`;
      } else {
        path += ` L ${pos.x} ${pos.y}`;
      }
    });
    return path;
  };

  const totalHeight = Math.ceil(steps.length / 2) * 180 + 180;

  const texts = {
    th: {
      start: 'เริ่มการเดินทาง',
      previous: 'ย้อนกลับ',
      next: 'ถัดไป',
      clickToView: 'คลิกเพื่อดูรายละเอียด',
    },
    en: {
      start: 'Start Journey',
      previous: 'Previous',
      next: 'Next',
      clickToView: 'Click to view details',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  return (
    <div className="relative w-full pb-24" style={{ minHeight: `${totalHeight}px` }}>
      {/* SVG Path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
      >
        {/* Background dotted path */}
        <path
          d={generatePath()}
          fill="none"
          stroke="#E8D5B0"
          strokeWidth="0.4"
          strokeDasharray="1.5 1.5"
        />

        {/* Completed path */}
        {isStarted && (
          <motion.path
            d={generatePath()}
            fill="none"
            stroke="#006B3F"
            strokeWidth="0.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: (currentStep + 1) / steps.length }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* Start Button */}
      {!isStarted && (
        <motion.div
          className="absolute left-1/2 top-4 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => {
              setIsStarted(true);
              setCurrentStep(0);
            }}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3"
          >
            <span className="text-2xl">{journeyIcon}</span>
            <span>{t.start}</span>
          </button>
        </motion.div>
      )}

      {/* Step Markers with Summary Cards */}
      {steps.map((step, index) => {
        const pos = getStepPosition(index);
        const isCompleted = isStarted && index < currentStep;
        const isActive = isStarted && index === currentStep;
        const isLocked = !isStarted || index > currentStep;
        const isHovered = hoveredStep === index;

        return (
          <motion.div
            key={step.id}
            className="absolute z-10"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Station Circle - Clickable */}
            <button
              onClick={() => {
                if (!isLocked) {
                  setCurrentStep(index);
                  onStepClick(step);
                }
              }}
              onMouseEnter={() => !isLocked && setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              disabled={isLocked}
              className={`
                relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl
                transition-all duration-300 
                ${isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/30' : ''}
                ${isActive ? 'bg-gold text-dark shadow-xl ring-4 ring-gold/30 scale-110' : ''}
                ${isLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
                ${!isCompleted && !isActive && !isLocked ? 'bg-white text-primary border-3 border-primary shadow-md hover:shadow-lg' : ''}
              `}
            >
              {isCompleted ? (
                <span className="text-2xl">✓</span>
              ) : (
                <span>{step.icon}</span>
              )}
              
              {/* Pulse animation for active */}
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30" />
              )}
            </button>

            {/* Summary Card - Shows on hover or active */}
            <AnimatePresence>
              {(isHovered || isActive) && !isLocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: pos.isLeft ? -10 : 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-56 md:w-64 z-20
                    ${pos.isLeft ? 'left-full ml-4' : 'right-full mr-4'}
                  `}
                >
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-primary to-primary-dark p-3 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                          {index + 1}/{steps.length}
                        </span>
                        {isCompleted && <span className="text-xs">✓ เสร็จสิ้น</span>}
                      </div>
                      <h4 className="font-bold mt-1 text-sm">{step.title}</h4>
                      <p className="text-xs font-arabic text-gold/90">{step.titleArabic}</p>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-3">
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {step.description}
                      </p>
                      
                      {/* Quick info */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {step.details.slice(0, 2).map((detail, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-full">
                            {detail.length > 25 ? detail.slice(0, 25) + '...' : detail}
                          </span>
                        ))}
                        {step.details.length > 2 && (
                          <span className="text-xs text-gray-400">+{step.details.length - 2}</span>
                        )}
                      </div>
                      
                      {/* CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStepClick(step);
                        }}
                        className="w-full text-xs bg-gold/10 text-primary font-medium py-2 rounded-lg hover:bg-gold/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>{t.clickToView}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Arrow pointer */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-gray-100 rotate-45
                      ${pos.isLeft ? '-left-1.5 border-l border-b' : '-right-1.5 border-r border-t'}
                    `}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simple label (shows when not hovered) */}
            {!isHovered && !isActive && (
              <div className={`
                absolute whitespace-nowrap text-center
                ${pos.isLeft ? 'left-full ml-3' : 'right-full mr-3'}
                top-1/2 -translate-y-1/2
              `}>
                <p className={`font-bold text-xs md:text-sm ${isCompleted ? 'text-primary' : isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
                  {step.title}
                </p>
                <p className="text-xs font-arabic text-gold">
                  {step.titleArabic}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Navigation Controls */}
      {isStarted && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 z-40"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                }
              }}
              disabled={currentStep === 0}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-medium transition-all text-sm md:text-base
                ${currentStep === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              <span>←</span>
              <span className="hidden sm:inline">{t.previous}</span>
            </button>

            <div className="flex items-center gap-3 flex-1 justify-center">
              {/* Progress dots */}
              <div className="hidden md:flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i <= currentStep ? 'bg-primary' : 'bg-gray-200'
                    } ${i === currentStep ? 'w-4' : ''}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            <button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={currentStep === steps.length - 1}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-medium transition-all text-sm md:text-base
                ${currentStep === steps.length - 1 
                  ? 'bg-gold/50 text-dark/50 cursor-not-allowed' 
                  : 'bg-gold text-dark hover:bg-gold-dark'}
              `}
            >
              <span className="hidden sm:inline">{t.next}</span>
              <span>→</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
