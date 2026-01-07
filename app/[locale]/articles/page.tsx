'use client';

import { useState } from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';

// Mock data - จะเปลี่ยนเป็น Supabase ภายหลัง
const mockArticles = [
  {
    id: '1',
    slug: 'importance-of-salah',
    title_th: 'ความสำคัญของการละหมาด',
    title_en: 'The Importance of Salah',
    excerpt_th: 'ละหมาดเป็นเสาหลักของศาสนาอิสลามและเป็นสิ่งแรกที่มนุษย์จะถูกถามในวันกิยามะฮ์ มาเรียนรู้ความสำคัญและผลบุญของการละหมาด',
    excerpt_en: 'Salah is the pillar of Islam and the first thing a person will be questioned about on the Day of Judgment. Learn about its importance and rewards.',
    cover_image: null,
    category: 'salah',
    tags: ['salah', 'pillar', 'worship'],
    views: 1250,
    published_at: '2024-01-15',
  },
  {
    id: '2',
    slug: 'preparing-for-umrah',
    title_th: 'เตรียมตัวไปอุมเราะฮ์',
    title_en: 'Preparing for Umrah',
    excerpt_th: 'คู่มือเตรียมตัวก่อนเดินทางไปประกอบพิธีอุมเราะฮ์ ณ นครมักกะฮ์ ตั้งแต่เอกสาร ของใช้ จนถึงดุอาที่ต้องท่อง',
    excerpt_en: 'A comprehensive guide to preparing for your Umrah journey to Makkah, from documents and essentials to duas to memorize.',
    cover_image: null,
    category: 'umrah',
    tags: ['umrah', 'preparation', 'travel'],
    views: 890,
    published_at: '2024-02-20',
  },
  {
    id: '3',
    slug: 'virtues-of-dhikr',
    title_th: 'ความประเสริฐของการซิกรุลลอฮ์',
    title_en: 'Virtues of Dhikr (Remembrance of Allah)',
    excerpt_th: 'การรำลึกถึงอัลลอฮ์เป็นอิบาดะฮ์ที่ง่ายแต่มีผลบุญมหาศาล มาเรียนรู้ซิกรประจำวันที่ควรท่อง',
    excerpt_en: 'Remembrance of Allah is an easy act of worship with immense rewards. Learn the daily adhkar you should recite.',
    cover_image: null,
    category: 'adhkar',
    tags: ['dhikr', 'adhkar', 'daily'],
    views: 2100,
    published_at: '2024-03-10',
  },
  {
    id: '4',
    slug: 'ramadan-preparation',
    title_th: 'เตรียมพร้อมต้อนรับเดือนรอมฎอน',
    title_en: 'Preparing for Ramadan',
    excerpt_th: 'เดือนรอมฎอนใกล้เข้ามาแล้ว มาเตรียมกายและใจให้พร้อมเพื่อรับเดือนอันประเสริฐนี้',
    excerpt_en: 'Ramadan is approaching. Let us prepare our body and soul to welcome this blessed month.',
    cover_image: null,
    category: 'sawm',
    tags: ['ramadan', 'fasting', 'preparation'],
    views: 1560,
    published_at: '2024-03-01',
  },
];

const categoryConfig: Record<string, { icon: string; color: string }> = {
  salah: { icon: '🕌', color: 'bg-emerald-100 text-emerald-700' },
  umrah: { icon: '✨', color: 'bg-teal-100 text-teal-700' },
  hajj: { icon: '🕋', color: 'bg-stone-100 text-stone-700' },
  zakat: { icon: '💰', color: 'bg-amber-100 text-amber-700' },
  sawm: { icon: '🌙', color: 'bg-indigo-100 text-indigo-700' },
  adhkar: { icon: '📿', color: 'bg-cyan-100 text-cyan-700' },
  general: { icon: '📖', color: 'bg-gray-100 text-gray-700' },
};

export default function ArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const [articles] = useState(mockArticles);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'salah', 'umrah', 'hajj', 'zakat', 'sawm', 'adhkar'];

  const filteredArticles = articles.filter(article => {
    const matchCategory = !selectedCategory || selectedCategory === 'all' || article.category === selectedCategory;
    const title = locale === 'th' ? article.title_th : article.title_en;
    const matchSearch = !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const texts = {
    th: {
      title: 'บทความ',
      subtitle: 'เรียนรู้และเพิ่มพูนความรู้ทางศาสนา',
      search: 'ค้นหาบทความ...',
      all: 'ทั้งหมด',
      readMore: 'อ่านต่อ',
      views: 'ครั้ง',
      noArticles: 'ไม่พบบทความ',
    },
    en: {
      title: 'Articles',
      subtitle: 'Learn and increase your religious knowledge',
      search: 'Search articles...',
      all: 'All',
      readMore: 'Read more',
      views: 'views',
      noArticles: 'No articles found',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            📚 {t.title}
          </motion.h1>
          <motion.p 
            className="text-lg text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'all' ? null : cat)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${(selectedCategory === cat || (cat === 'all' && !selectedCategory))
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {cat === 'all' ? t.all : (
                    <span className="flex items-center gap-1">
                      <span>{categoryConfig[cat]?.icon}</span>
                      <span className="capitalize">{cat}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t.noArticles}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => {
                const title = locale === 'th' ? article.title_th : article.title_en;
                const excerpt = locale === 'th' ? article.excerpt_th : article.excerpt_en;
                const config = categoryConfig[article.category] || categoryConfig.general;

                return (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                  >
                    {/* Cover Image or Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
                      <span className="text-6xl opacity-50">{config.icon}</span>
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                          {config.icon} {article.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(article.published_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          👁 {article.views.toLocaleString()} {t.views}
                        </span>
                        <Link
                          href={`/${locale}/articles/${article.slug}`}
                          className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
                        >
                          {t.readMore}
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
