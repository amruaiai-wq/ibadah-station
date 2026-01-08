'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { use } from 'react';

interface Quiz {
  id: string;
  title_th: string;
  title_en: string;
  description_th?: string;
  description_en?: string;
  category: string;
  difficulty: string;
  questions_count: number;
}

const categoryIcons: Record<string, string> = {
  salah: '🕌',
  wudu: '💧',
  umrah: '🕋',
  hajj: '🏕️',
  zakat: '💝',
  sawm: '🌙',
  adhkar: '📿',
  general: '📚',
};

const categoryNames: Record<string, Record<string, string>> = {
  salah: { th: 'ละหมาด', en: 'Salah' },
  wudu: { th: 'วุฎูอฺ', en: 'Wudu' },
  umrah: { th: 'อุมเราะฮ์', en: 'Umrah' },
  hajj: { th: 'ฮัจญ์', en: 'Hajj' },
  zakat: { th: 'ซะกาต', en: 'Zakat' },
  sawm: { th: 'ถือศีลอด', en: 'Sawm' },
  adhkar: { th: 'อัซการ์', en: 'Adhkar' },
  general: { th: 'ทั่วไป', en: 'General' },
};

const difficultyStyles: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const difficultyNames: Record<string, Record<string, string>> = {
  easy: { th: 'ง่าย', en: 'Easy' },
  medium: { th: 'ปานกลาง', en: 'Medium' },
  hard: { th: 'ยาก', en: 'Hard' },
};

export default function QuizListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = {
    th: {
      title: 'ควิซทดสอบความรู้',
      subtitle: 'ทดสอบความรู้ด้านศาสนาอิสลามของคุณ',
      questions: 'คำถาม',
      startQuiz: 'เริ่มทำควิซ',
      noQuizzes: 'ยังไม่มีควิซในขณะนี้',
      allCategories: 'ทั้งหมด',
      filterBy: 'กรองตาม',
    },
    en: {
      title: 'Knowledge Quiz',
      subtitle: 'Test your Islamic knowledge',
      questions: 'Questions',
      startQuiz: 'Start Quiz',
      noQuizzes: 'No quizzes available at the moment',
      allCategories: 'All',
      filterBy: 'Filter by',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = selectedCategory === 'all'
    ? quizzes
    : quizzes.filter(q => q.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(quizzes.map(q => q.category)))];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary mb-4">{text.title}</h1>
          <p className="text-gray-600 text-lg">{text.subtitle}</p>
        </motion.div>

        {/* Category Filter */}
        {quizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat === 'all' ? (
                  text.allCategories
                ) : (
                  <>
                    {categoryIcons[cat]} {categoryNames[cat]?.[locale] || cat}
                  </>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {/* Quiz Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">📝</span>
            <p className="text-gray-500 text-lg">{text.noQuizzes}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/${locale}/quiz/${quiz.id}`}>
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{categoryIcons[quiz.category] || '📚'}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyStyles[quiz.difficulty]}`}>
                          {difficultyNames[quiz.difficulty]?.[locale] || quiz.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold line-clamp-2">
                        {locale === 'th' ? quiz.title_th : quiz.title_en}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {(quiz.description_th || quiz.description_en) && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {locale === 'th' ? quiz.description_th : quiz.description_en}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-primary">{quiz.questions_count}</span> {text.questions}
                        </div>
                        <span className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          {text.startQuiz} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href={`/${locale}`}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            ← {locale === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
