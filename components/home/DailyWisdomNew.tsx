'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Wisdom {
  id: string;
  arabic: string;
  transliteration: string;
  meaning_th: string;
  meaning_en: string;
  source: string;
  source_detail?: string;
}

const wisdoms: Wisdom[] = [
  {
    id: '1',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    transliteration: "Inna ma'al usri yusra",
    meaning_th: 'แท้จริงพร้อมกับความยากลำบากนั้นมีความง่ายดาย',
    meaning_en: 'Indeed, with hardship comes ease',
    source: 'Quran',
    source_detail: 'Surah Ash-Sharh 94:6',
  },
  {
    id: '2',
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    transliteration: "Wa man yattaqillaha yaj'al lahu makhraja",
    meaning_th: 'และผู้ใดที่ยำเกรงอัลลอฮ์ พระองค์จะทรงหาทางออกให้แก่เขา',
    meaning_en: 'And whoever fears Allah - He will make for him a way out',
    source: 'Quran',
    source_detail: 'Surah At-Talaq 65:2',
  },
  {
    id: '3',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    transliteration: "Khairukum man ta'allamal Qurana wa 'allamah",
    meaning_th: 'ผู้ที่ดีที่สุดในหมู่พวกท่าน คือผู้ที่เรียนอัลกุรอานและสอนมัน',
    meaning_en: 'The best among you are those who learn the Quran and teach it',
    source: 'Hadith',
    source_detail: 'Sahih Bukhari',
  },
  {
    id: '4',
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    transliteration: "Ad-du'a huwal 'ibadah",
    meaning_th: 'การวิงวอน(ดุอา)คืออิบาดะฮ์',
    meaning_en: 'Supplication (Dua) is worship',
    source: 'Hadith',
    source_detail: 'Sunan At-Tirmidhi',
  },
  {
    id: '5',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    transliteration: "Innamal a'malu binniyyat",
    meaning_th: 'แท้จริงการงานทั้งหลายขึ้นอยู่กับเจตนา',
    meaning_en: 'Actions are judged by intentions',
    source: 'Hadith',
    source_detail: 'Sahih Bukhari & Muslim',
  },
];

interface DailyWisdomNewProps {
  locale: string;
}

export default function DailyWisdomNew({ locale }: DailyWisdomNewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentIndex(dayOfYear % wisdoms.length);
  }, []);

  const wisdom = wisdoms[currentIndex];
  const meaning = locale === 'th' ? wisdom.meaning_th : wisdom.meaning_en;

  const texts = {
    th: {
      title: 'ข้อคิดประจำวัน',
      source: 'ที่มา',
      tapToFlip: 'แตะเพื่อดูความหมาย',
      tapToSeeArabic: 'แตะเพื่อดูภาษาอาหรับ',
      next: 'ถัดไป',
      prev: 'ก่อนหน้า',
    },
    en: {
      title: 'Daily Wisdom',
      source: 'Source',
      tapToFlip: 'Tap to see meaning',
      tapToSeeArabic: 'Tap to see Arabic',
      next: 'Next',
      prev: 'Previous',
    }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  const nextWisdom = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % wisdoms.length);
    }, 200);
  };

  const prevWisdom = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + wisdoms.length) % wisdoms.length);
    }, 200);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-gold/5 to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 text-primary rounded-full text-sm font-medium mb-4">
            <span className="text-xl">✨</span>
            {t.title}
          </span>
        </motion.div>

        {/* Card */}
        <div className="perspective-1000">
          <motion.div
            className="relative w-full h-80 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front - Arabic */}
            <div 
              className="absolute inset-0 backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="h-full bg-gradient-to-br from-primary via-primary-dark to-emerald-900 rounded-3xl p-8 shadow-2xl overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                  <motion.div 
                    className="text-4xl mb-4"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🌙
                  </motion.div>
                  
                  <p className="text-3xl md:text-4xl lg:text-5xl font-arabic text-white leading-relaxed mb-6">
                    {wisdom.arabic}
                  </p>
                  
                  <p className="text-gold italic text-lg">
                    &ldquo;{wisdom.transliteration}&rdquo;
                  </p>

                  <motion.p 
                    className="absolute bottom-4 text-white/50 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👆 {t.tapToFlip}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Back - Meaning */}
            <div 
              className="absolute inset-0 backface-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="h-full bg-gradient-to-br from-gold via-gold-light to-amber-200 rounded-3xl p-8 shadow-2xl">
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <motion.div 
                    className="text-4xl mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📖
                  </motion.div>
                  
                  <p className="text-2xl md:text-3xl font-bold text-primary-dark leading-relaxed mb-6">
                    {meaning}
                  </p>
                  
                  <div className="flex items-center gap-2 text-primary/70">
                    <span>📜</span>
                    <span>{t.source}: {wisdom.source}</span>
                    {wisdom.source_detail && (
                      <span className="text-primary/50">({wisdom.source_detail})</span>
                    )}
                  </div>

                  <motion.p 
                    className="absolute bottom-4 text-primary/50 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👆 {t.tapToSeeArabic}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prevWisdom}
            className="px-6 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-primary"
          >
            ← {t.prev}
          </button>
          
          <div className="flex gap-2">
            {wisdoms.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextWisdom}
            className="px-6 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-primary"
          >
            {t.next} →
          </button>
        </div>
      </div>
    </section>
  );
}
