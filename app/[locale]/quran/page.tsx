'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getChapters, Chapter } from '@/lib/quran-api';

interface QuranPageProps {
  params: { locale: string };
}

export default function QuranPage({ params: { locale } }: QuranPageProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'makkah' | 'madinah'>('all');

  const texts = {
    th: {
      title: 'อัลกุรอาน',
      titleArabic: 'القرآن الكريم',
      subtitle: 'พระมหาคัมภีร์แห่งอิสลาม 114 ซูเราะฮ์',
      search: 'ค้นหาซูเราะฮ์...',
      all: 'ทั้งหมด',
      makkah: 'มักกะฮ์',
      madinah: 'มะดีนะฮ์',
      verses: 'อายะฮ์',
      back: 'กลับ',
      loading: 'กำลังโหลด...',
      readNow: 'อ่าน',
    },
    en: {
      title: 'Al-Quran',
      titleArabic: 'القرآن الكريم',
      subtitle: 'The Holy Book of Islam - 114 Surahs',
      search: 'Search surah...',
      all: 'All',
      makkah: 'Makki',
      madinah: 'Madani',
      verses: 'verses',
      back: 'Back',
      loading: 'Loading...',
      readNow: 'Read',
    },
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  useEffect(() => {
    async function fetchChapters() {
      try {
        const data = await getChapters();
        setChapters(data);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChapters();
  }, []);

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch =
      chapter.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.name_arabic.includes(searchTerm) ||
      chapter.translated_name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.id.toString() === searchTerm;

    const matchesFilter =
      filter === 'all' || chapter.revelation_place === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white py-16 relative overflow-hidden">
        {/* Islamic Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 40L40 80L0 40L40 0zm0 20L20 40l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>{t.back}</span>
          </Link>

          <div className="text-center">
            <motion.span
              className="text-6xl mb-4 block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              📖
            </motion.span>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t.title}
            </motion.h1>
            <motion.p
              className="text-4xl font-arabic text-gold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t.titleArabic}
            </motion.p>
            <motion.p
              className="text-lg text-white/80 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t.subtitle}
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex justify-center gap-8 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">114</p>
                <p className="text-white/60 text-sm">
                  {locale === 'th' ? 'ซูเราะฮ์' : 'Surahs'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">6,236</p>
                <p className="text-white/60 text-sm">
                  {locale === 'th' ? 'อายะฮ์' : 'Verses'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">30</p>
                <p className="text-white/60 text-sm">
                  {locale === 'th' ? 'ญุซอ์' : 'Juz'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'makkah', 'madinah'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? t.all : f === 'makkah' ? t.makkah : t.madinah}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Surah List */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">{t.loading}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredChapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link href={`/${locale}/quran/${chapter.id}`}>
                    <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-emerald-500">
                      <div className="flex items-center gap-4">
                        {/* Surah Number */}
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                          {chapter.id}
                        </div>

                        {/* Surah Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-lg">
                              {chapter.name_simple}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                chapter.revelation_place === 'makkah'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {chapter.revelation_place === 'makkah'
                                ? t.makkah
                                : t.madinah}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">
                            {chapter.translated_name.name} • {chapter.verses_count}{' '}
                            {t.verses}
                          </p>
                        </div>

                        {/* Arabic Name */}
                        <div className="text-right">
                          <p className="text-2xl font-arabic text-emerald-700">
                            {chapter.name_arabic}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
                          →
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
