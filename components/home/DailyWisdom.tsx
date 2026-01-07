'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostcardModal from '@/components/ui/PostcardModal';
import { WisdomData } from '@/lib/pdfExport';

interface Wisdom {
  id: string;
  arabic: string;
  transliteration: string;
  meaning_th: string;
  meaning_en: string;
  source: string;
  source_detail?: string;
}

const mockWisdoms: Wisdom[] = [
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

interface DailyWisdomProps {
  locale: string;
}

export default function DailyWisdom({ locale }: DailyWisdomProps) {
  const [wisdom, setWisdom] = useState<Wisdom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostcardOpen, setIsPostcardOpen] = useState(false);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const wisdomIndex = dayOfYear % mockWisdoms.length;
    setWisdom(mockWisdoms[wisdomIndex]);
    setIsLoading(false);
  }, []);

  const texts = {
    th: {
      title: 'ข้อคิดประจำวัน',
      source: 'ที่มา',
      share: 'แชร์',
      createPostcard: 'สร้าง Postcard',
    },
    en: {
      title: 'Daily Wisdom',
      source: 'Source',
      share: 'Share',
      createPostcard: 'Create Postcard',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  if (isLoading || !wisdom) {
    return (
      <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-gold/20 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-gold/20 rounded w-full mb-4"></div>
        <div className="h-4 bg-gold/20 rounded w-2/3"></div>
      </div>
    );
  }

  const meaning = locale === 'th' ? wisdom.meaning_th : wisdom.meaning_en;

  const postcardData: WisdomData = {
    arabic: wisdom.arabic,
    transliteration: wisdom.transliteration,
    meaning: meaning,
    source: wisdom.source,
    sourceDetail: wisdom.source_detail,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="bg-gradient-to-br from-primary/10 via-gold/10 to-primary/5 rounded-2xl p-8 md:p-10 border border-gold/20">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-4xl opacity-20">✨</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-20">🌙</div>

          {/* Title & Share Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <h3 className="text-xl font-bold text-primary">{t.title}</h3>
            </div>
            <button
              onClick={() => setIsPostcardOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/20 text-primary rounded-full 
                       hover:bg-gold/30 transition-colors text-sm font-medium"
            >
              <span>🎴</span>
              <span>{t.createPostcard}</span>
            </button>
          </div>

          {/* Arabic Text */}
          <div className="bg-white/60 rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-3xl md:text-4xl font-arabic text-center leading-loose text-gray-800">
              {wisdom.arabic}
            </p>
          </div>

          {/* Transliteration */}
          <p className="text-center text-gray-600 italic mb-4 text-lg">
            &ldquo;{wisdom.transliteration}&rdquo;
          </p>

          {/* Meaning */}
          <p className="text-center text-gray-800 font-medium text-xl mb-6">
            {meaning}
          </p>

          {/* Source */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="text-gold">📜</span>
            <span>{t.source}: {wisdom.source}</span>
            {wisdom.source_detail && (
              <span className="text-gray-400">({wisdom.source_detail})</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Postcard Modal */}
      <PostcardModal
        isOpen={isPostcardOpen}
        onClose={() => setIsPostcardOpen(false)}
        type="wisdom"
        data={postcardData}
        locale={locale}
      />
    </>
  );
}
