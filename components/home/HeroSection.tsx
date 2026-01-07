'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const [currentText, setCurrentText] = useState(0);

  const texts = {
    th: {
      bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      titles: [
        'เริ่มต้นการเดินทางแห่งอิบาดะฮ์',
        'เรียนรู้การละหมาดอย่างถูกต้อง',
        'เตรียมตัวสู่บ้านของอัลลอฮ์',
      ],
      subtitle: 'แพลตฟอร์มเรียนรู้การปฏิบัติศาสนกิจในอิสลาม ด้วยขั้นตอนที่เข้าใจง่าย พร้อมภาพและเสียงประกอบ',
      cta: 'เริ่มการเดินทาง',
      scroll: 'เลื่อนลงเพื่อดูเพิ่มเติม',
    },
    en: {
      bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      titles: [
        'Begin Your Ibadah Journey',
        'Learn to Pray Correctly',
        'Prepare for the House of Allah',
      ],
      subtitle: 'An interactive platform to learn Islamic worship practices with easy-to-follow steps, visuals, and audio guidance',
      cta: 'Start Journey',
      scroll: 'Scroll down to explore',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % t.titles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [t.titles.length]);

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-emerald-950" />
      
      {/* Animated Islamic Pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 60, 
            repeat: Infinity, 
            repeatType: 'reverse' 
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 40L40 80L0 40L40 0zm0 20L20 40l20 20 20-20-20-20z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gold/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Decorative Crescents */}
      <motion.div 
        className="absolute top-20 left-10 text-6xl md:text-8xl opacity-20 select-none"
        animate={{ rotate: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        🌙
      </motion.div>
      <motion.div 
        className="absolute bottom-20 right-10 text-4xl md:text-6xl opacity-20 select-none"
        animate={{ rotate: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        ⭐
      </motion.div>
      <motion.div 
        className="absolute top-1/4 right-20 text-3xl md:text-4xl opacity-10 select-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ✨
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1.5 }}
          className="mb-8"
        >
          <div className="inline-block p-2 bg-white/10 backdrop-blur-sm rounded-full">
            <Image
              src="/logo.jpg"
              alt="Ibadah Station"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        </motion.div>

        {/* Bismillah */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-arabic text-gold mb-6"
        >
          {t.bismillah}
        </motion.p>

        {/* Animated Title */}
        <div className="h-24 md:h-32 flex items-center justify-center mb-6">
          <motion.h1
            key={currentText}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            {t.titles[currentText]}
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10"
        >
          {t.subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <a
            href="#journeys"
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold to-gold-light text-dark font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(197,165,114,0.5)]"
          >
            <span className="relative z-10">{t.cta}</span>
            <motion.span 
              className="relative z-10 text-2xl"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
            <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/50"
          >
            <span className="text-sm">{t.scroll}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#FDF8F3"
          />
        </svg>
      </div>
    </section>
  );
}
