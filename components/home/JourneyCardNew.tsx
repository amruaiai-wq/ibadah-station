'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface JourneyCardNewProps {
  type: 'salah' | 'umrah' | 'hajj' | 'zakat' | 'sawm' | 'adhkar';
  locale: string;
  progress?: number;
  disabled?: boolean;
}

const journeyData = {
  salah: {
    icon: '🕌',
    gradient: 'from-emerald-500 to-emerald-700',
    shadowColor: 'shadow-emerald-500/30',
    th: { title: 'การละหมาด', titleArabic: 'الصلاة', description: 'เรียนรู้วิธีละหมาด 5 เวลาอย่างถูกต้อง', steps: 11 },
    en: { title: 'Salah Prayer', titleArabic: 'الصلاة', description: 'Learn the complete 5 daily prayers', steps: 11 },
  },
  umrah: {
    icon: '🕋',
    gradient: 'from-teal-500 to-teal-700',
    shadowColor: 'shadow-teal-500/30',
    th: { title: 'อุมเราะฮ์', titleArabic: 'العمرة', description: 'ขั้นตอนการประกอบพิธีอุมเราะฮ์', steps: 10 },
    en: { title: 'Umrah', titleArabic: 'العمرة', description: 'Complete guide to performing Umrah', steps: 10 },
  },
  hajj: {
    icon: '🏔️',
    gradient: 'from-amber-600 to-amber-800',
    shadowColor: 'shadow-amber-500/30',
    th: { title: 'ฮัจญ์', titleArabic: 'الحج', description: 'การประกอบพิธีฮัจญ์ครบทุกขั้นตอน', steps: 15 },
    en: { title: 'Hajj', titleArabic: 'الحج', description: 'Complete Hajj pilgrimage guide', steps: 15 },
  },
  zakat: {
    icon: '💎',
    gradient: 'from-violet-500 to-violet-700',
    shadowColor: 'shadow-violet-500/30',
    th: { title: 'ซะกาต', titleArabic: 'الزكاة', description: 'คำนวณและจ่ายซะกาตอย่างถูกต้อง', steps: 6 },
    en: { title: 'Zakat', titleArabic: 'الزكاة', description: 'Calculate and pay Zakat correctly', steps: 6 },
  },
  sawm: {
    icon: '🌙',
    gradient: 'from-indigo-500 to-indigo-700',
    shadowColor: 'shadow-indigo-500/30',
    th: { title: 'การถือศีลอด', titleArabic: 'الصوم', description: 'เรียนรู้การถือศีลอดในเดือนรอมฎอน', steps: 8 },
    en: { title: 'Sawm (Fasting)', titleArabic: 'الصوم', description: 'Learn fasting during Ramadan', steps: 8 },
  },
  adhkar: {
    icon: '📿',
    gradient: 'from-rose-500 to-rose-700',
    shadowColor: 'shadow-rose-500/30',
    th: { title: 'อัซการ์', titleArabic: 'الأذكار', description: 'ดุอาและซิกรุลลอฮ์ประจำวัน', steps: 12 },
    en: { title: 'Daily Adhkar', titleArabic: 'الأذكار', description: 'Daily duas and remembrance', steps: 12 },
  },
};

export default function JourneyCardNew({ type, locale, progress = 0, disabled = false }: JourneyCardNewProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const journey = journeyData[type];
  const content = journey[locale as keyof typeof journey] as { title: string; titleArabic: string; description: string; steps: number };
  
  const texts = {
    th: { steps: 'ขั้นตอน', start: 'เริ่มเรียนรู้', continue: 'เรียนต่อ', comingSoon: 'เร็วๆ นี้' },
    en: { steps: 'steps', start: 'Start Learning', continue: 'Continue', comingSoon: 'Coming Soon' },
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  const CardContent = (
    <motion.div
      className={`relative h-full rounded-3xl overflow-hidden cursor-pointer ${disabled ? 'opacity-60' : ''}`}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={disabled ? {} : { scale: 1.02, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${journey.gradient}`} />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0zm0 8L8 20l12 12 12-12-12-12z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Glow Effect on Hover */}
      <motion.div
        className={`absolute inset-0 bg-white/20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Icon */}
        <motion.div 
          className="text-5xl mb-4"
          animate={isHovered ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {journey.icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-1">{content.title}</h3>
        <p className="text-xl font-arabic text-white/80 mb-3">{content.titleArabic}</p>
        
        {/* Description */}
        <p className="text-white/70 text-sm flex-grow">{content.description}</p>

        {/* Progress Bar */}
        {!disabled && progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{progress}% complete</span>
              <span>{content.steps} {t.steps}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          className="mt-4 flex items-center justify-between"
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 5, opacity: 0.8 }}
        >
          <span className="text-white font-semibold">
            {disabled ? t.comingSoon : (progress > 0 ? t.continue : t.start)}
          </span>
          {!disabled && (
            <motion.span 
              className="text-white text-xl"
              animate={isHovered ? { x: [0, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
            >
              →
            </motion.span>
          )}
          {disabled && (
            <span className="text-white/50">🔒</span>
          )}
        </motion.div>
      </div>

      {/* Shadow */}
      <motion.div
        className={`absolute -bottom-4 left-4 right-4 h-8 ${journey.shadowColor} blur-xl rounded-full`}
        animate={{ opacity: isHovered ? 0.8 : 0.4 }}
      />
    </motion.div>
  );

  if (disabled) {
    return <div className="h-72">{CardContent}</div>;
  }

  return (
    <Link href={`/${locale}/journey/${type}`} className="block h-72">
      {CardContent}
    </Link>
  );
}
