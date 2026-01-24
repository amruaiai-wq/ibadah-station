'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import FiqhComparisonTable from '@/components/fiqh/FiqhComparisonTable';

export default function ComparativeFiqhPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('comparativeFiqh');
  const tCommon = useTranslations('common');

  const categories = t.raw('categories') as Array<{
    id: string;
    title: string;
    titleArabic: string;
    icon: string;
    topics: Array<{
      id: string;
      title: string;
      titleArabic: string;
      opinions: {
        hanafi: string;
        maliki: string;
        shafii: string;
        hanbali: string;
      };
      evidence?: string;
    }>;
  }>;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 text-white py-16 relative overflow-hidden">
        {/* Animated Pattern */}
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
            <motion.span
              animate={{ x: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ←
            </motion.span>
            <span>{tCommon('buttons.back')}</span>
          </Link>

          <div className="text-center">
            <motion.span
              className="text-6xl mb-4 block"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1 }}
            >
              ⚖️
            </motion.span>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t('title')}
            </motion.h1>
            <motion.p
              className="text-3xl font-arabic text-gold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('titleArabic')}
            </motion.p>
            <motion.p
              className="text-lg text-white/80 max-w-2xl mx-auto mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('description')}
            </motion.p>
            <motion.p
              className="text-sm text-white/60 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t('source')}
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex justify-center gap-8 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">4</p>
                <p className="text-white/60 text-sm">{locale === 'th' ? 'มัซฮับ' : 'Madhabs'}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">{categories.length}</p>
                <p className="text-white/60 text-sm">{locale === 'th' ? 'หมวดหมู่' : 'Categories'}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">
                  {categories.reduce((acc, cat) => acc + cat.topics.length, 0)}
                </p>
                <p className="text-white/60 text-sm">{locale === 'th' ? 'ประเด็น' : 'Topics'}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#FDF8F3"/>
          </svg>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <FiqhComparisonTable categories={categories} locale={locale} />
        </div>
      </section>

      {/* Source Attribution */}
      <section className="py-8 px-4 bg-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            {locale === 'th'
              ? 'ข้อมูลอ้างอิงจากหนังสือ "บิดายะตุลมุจญ์ตะฮิด" โดย อิบนุ รุชด์ (ค.ศ. 1126-1198)'
              : 'Reference: "Bidayat al-Mujtahid" by Ibn Rushd (1126-1198 CE)'
            }
          </p>
          <p className="text-xs text-gray-400 mt-1 font-arabic">
            بداية المجتهد ونهاية المقتصد - ابن رشد
          </p>
        </div>
      </section>
    </div>
  );
}
