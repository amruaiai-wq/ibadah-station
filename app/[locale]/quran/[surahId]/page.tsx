'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getChapter, getVersesWithTranslation, Chapter, Verse } from '@/lib/quran-api';

interface SurahPageProps {
  params: { locale: string; surahId: string };
}

export default function SurahPage({ params: { locale, surahId } }: SurahPageProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const chapterNumber = parseInt(surahId, 10);

  const texts = {
    th: {
      back: 'กลับไปรายการซูเราะฮ์',
      verses: 'อายะฮ์',
      makkah: 'มักกะฮ์',
      madinah: 'มะดีนะฮ์',
      loading: 'กำลังโหลด...',
      showTranslation: 'แสดงคำแปล',
      hideTranslation: 'ซ่อนคำแปล',
      fontSize: 'ขนาดตัวอักษร',
      normal: 'ปกติ',
      large: 'ใหญ่',
      xlarge: 'ใหญ่มาก',
      prev: 'ซูเราะฮ์ก่อนหน้า',
      next: 'ซูเราะฮ์ถัดไป',
      bismillah: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      bismillahMeaning: 'ด้วยพระนามของอัลลอฮ์ ผู้ทรงกรุณาปรานี ผู้ทรงเมตตาเสมอ',
    },
    en: {
      back: 'Back to Surah List',
      verses: 'verses',
      makkah: 'Makki',
      madinah: 'Madani',
      loading: 'Loading...',
      showTranslation: 'Show Translation',
      hideTranslation: 'Hide Translation',
      fontSize: 'Font Size',
      normal: 'Normal',
      large: 'Large',
      xlarge: 'X-Large',
      prev: 'Previous Surah',
      next: 'Next Surah',
      bismillah: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      bismillahMeaning: 'In the name of Allah, the Most Gracious, the Most Merciful',
    },
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [chapterData, versesData] = await Promise.all([
          getChapter(chapterNumber),
          getVersesWithTranslation(chapterNumber, locale),
        ]);
        setChapter(chapterData);
        setVerses(versesData);
      } catch (error) {
        console.error('Error fetching surah:', error);
      } finally {
        setLoading(false);
      }
    }
    if (chapterNumber >= 1 && chapterNumber <= 114) {
      fetchData();
    }
  }, [chapterNumber, locale]);

  const fontSizeClasses = {
    normal: 'text-2xl',
    large: 'text-3xl',
    xlarge: 'text-4xl',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-500">Surah not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 40L40 80L0 40L40 0zm0 20L20 40l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link
            href={`/${locale}/quran`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>{t.back}</span>
          </Link>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4"
            >
              {chapter.id}
            </motion.div>

            <motion.h1
              className="text-4xl font-arabic text-gold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {chapter.name_arabic}
            </motion.h1>

            <motion.p
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {chapter.name_simple}
            </motion.p>

            <motion.p
              className="text-white/70 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {chapter.translated_name.name} • {chapter.verses_count} {t.verses} •{' '}
              {chapter.revelation_place === 'makkah' ? t.makkah : t.madinah}
            </motion.p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 40L60 35C120 30 240 20 360 15C480 10 600 15 720 18C840 21 960 21 1080 18C1200 15 1320 10 1380 7L1440 4V40H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* Controls */}
      <section className="sticky top-0 z-20 bg-white shadow-md py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Translation Toggle */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              showTranslation
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showTranslation ? t.hideTranslation : t.showTranslation}
          </button>

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t.fontSize}:</span>
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  fontSize === size
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size === 'normal' ? t.normal : size === 'large' ? t.large : t.xlarge}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Verses */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Bismillah - except for Surah At-Tawbah (9) */}
          {chapter.bismillah_pre && (
            <motion.div
              className="text-center mb-8 p-6 bg-white rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-3xl font-arabic text-emerald-700 mb-2">
                {t.bismillah}
              </p>
              {showTranslation && (
                <p className="text-gray-600 text-sm">{t.bismillahMeaning}</p>
              )}
            </motion.div>
          )}

          {/* Verse List */}
          <div className="space-y-4">
            {verses.map((verse, index) => (
              <motion.div
                key={verse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Verse Number Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {verse.verse_number}
                  </div>
                  <span className="text-gray-400 text-sm">{verse.verse_key}</span>
                </div>

                {/* Arabic Text */}
                <p
                  className={`font-arabic text-right leading-loose text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}
                  dir="rtl"
                >
                  {verse.text_uthmani}
                </p>

                {/* Translation */}
                {showTranslation && verse.translation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-gray-100"
                  >
                    <p className="text-gray-600 leading-relaxed">{verse.translation}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
            {chapterNumber > 1 ? (
              <Link
                href={`/${locale}/quran/${chapterNumber - 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                <span>←</span>
                <span>{t.prev}</span>
              </Link>
            ) : (
              <div />
            )}

            {chapterNumber < 114 ? (
              <Link
                href={`/${locale}/quran/${chapterNumber + 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                <span>{t.next}</span>
                <span>→</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
