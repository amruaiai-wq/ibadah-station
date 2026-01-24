'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Opinion {
  hanafi: string;
  maliki: string;
  shafii: string;
  hanbali: string;
}

interface Topic {
  id: string;
  title: string;
  titleArabic: string;
  opinions: Opinion;
  evidence?: string;
}

interface Category {
  id: string;
  title: string;
  titleArabic: string;
  icon: string;
  topics: Topic[];
}

interface MadhhabInfo {
  name: string;
  nameArabic: string;
  founder: string;
  color: string;
  bgColor: string;
  textColor: string;
}

interface FiqhComparisonTableProps {
  categories: Category[];
  locale: string;
}

const madhhabInfo: Record<string, MadhhabInfo> = {
  hanafi: {
    name: 'ฮานาฟี',
    nameArabic: 'الحَنَفِي',
    founder: 'อบู ฮานีฟะฮ์',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  maliki: {
    name: 'มาลิกี',
    nameArabic: 'المَالِكِي',
    founder: 'มาลิก บิน อะนัส',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  shafii: {
    name: 'ชาฟิอี',
    nameArabic: 'الشَّافِعِي',
    founder: 'มุฮัมมัด บิน อิดรีส',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  hanbali: {
    name: 'ฮัมบาลี',
    nameArabic: 'الحَنْبَلِي',
    founder: 'อะหมัด บิน ฮัมบัล',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
};

const madhhabInfoEn: Record<string, MadhhabInfo> = {
  hanafi: {
    name: 'Hanafi',
    nameArabic: 'الحَنَفِي',
    founder: 'Abu Hanifa',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  maliki: {
    name: 'Maliki',
    nameArabic: 'المَالِكِي',
    founder: 'Malik ibn Anas',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  shafii: {
    name: 'Shafi\'i',
    nameArabic: 'الشَّافِعِي',
    founder: 'Muhammad ibn Idris',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  hanbali: {
    name: 'Hanbali',
    nameArabic: 'الحَنْبَلِي',
    founder: 'Ahmad ibn Hanbal',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
};

export default function FiqhComparisonTable({ categories, locale }: FiqhComparisonTableProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0]?.id || null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const info = locale === 'th' ? madhhabInfo : madhhabInfoEn;
  const madhhabKeys = ['hanafi', 'maliki', 'shafii', 'hanbali'] as const;

  const texts = {
    th: {
      evidence: 'หลักฐาน/เหตุผล',
      clickToExpand: 'คลิกเพื่อดูรายละเอียด',
      topics: 'หัวข้อ',
    },
    en: {
      evidence: 'Evidence/Reasoning',
      clickToExpand: 'Click to expand',
      topics: 'Topics',
    },
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  return (
    <div className="space-y-6">
      {/* Madhhab Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {madhhabKeys.map((key) => (
          <motion.div
            key={key}
            className={`${info[key].bgColor} rounded-2xl p-4 text-center border-2 border-${info[key].color}-200`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <p className={`font-arabic text-lg ${info[key].textColor}`}>{info[key].nameArabic}</p>
            <p className={`font-bold ${info[key].textColor}`}>{info[key].name}</p>
            <p className="text-xs text-gray-500 mt-1">{info[key].founder}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      {categories.map((category, catIndex) => (
        <motion.div
          key={category.id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: catIndex * 0.1 }}
        >
          {/* Category Header */}
          <button
            onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div className="text-left">
                <h3 className="text-lg font-bold">{category.title}</h3>
                <p className="font-arabic text-gold text-sm">{category.titleArabic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">{category.topics.length} {t.topics}</span>
              <motion.span
                animate={{ rotate: expandedCategory === category.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </div>
          </button>

          {/* Topics */}
          <AnimatePresence>
            {expandedCategory === category.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {category.topics.map((topic, topicIndex) => (
                    <motion.div
                      key={topic.id}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: topicIndex * 0.05 }}
                    >
                      {/* Topic Header */}
                      <button
                        onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-800">{topic.title}</h4>
                          <p className="font-arabic text-gray-500 text-sm">{topic.titleArabic}</p>
                        </div>
                        <motion.span
                          animate={{ rotate: expandedTopic === topic.id ? 180 : 0 }}
                          className="text-gray-400"
                        >
                          ▼
                        </motion.span>
                      </button>

                      {/* Comparison Table */}
                      <AnimatePresence>
                        {expandedTopic === topic.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    {madhhabKeys.map((key) => (
                                      <th
                                        key={key}
                                        className={`${info[key].bgColor} ${info[key].textColor} px-4 py-2 text-center font-bold border-b`}
                                      >
                                        {info[key].name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    {madhhabKeys.map((key) => (
                                      <td
                                        key={key}
                                        className="px-4 py-3 text-sm text-gray-700 border-r last:border-r-0 align-top"
                                      >
                                        {topic.opinions[key]}
                                      </td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden p-4 space-y-3">
                              {madhhabKeys.map((key) => (
                                <div
                                  key={key}
                                  className={`${info[key].bgColor} rounded-lg p-3`}
                                >
                                  <p className={`font-bold ${info[key].textColor} mb-1`}>
                                    {info[key].name}
                                  </p>
                                  <p className="text-sm text-gray-700">{topic.opinions[key]}</p>
                                </div>
                              ))}
                            </div>

                            {/* Evidence Section */}
                            {topic.evidence && (
                              <div className="px-4 py-3 bg-indigo-50 border-t">
                                <p className="text-xs font-semibold text-indigo-600 mb-1">
                                  📚 {t.evidence}
                                </p>
                                <p className="text-sm text-gray-600">{topic.evidence}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
