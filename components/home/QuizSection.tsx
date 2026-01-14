'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface QuizSectionProps {
  locale: string;
}

export default function QuizSection({ locale }: QuizSectionProps) {
  const texts = {
    th: {
      title: 'ทดสอบความรู้',
      subtitle: 'ทดสอบความเข้าใจของคุณเกี่ยวกับหลักปฏิบัติในอิสลาม',
      description: 'ตอบคำถามและเรียนรู้ไปพร้อมกัน พร้อมรับคำอธิบายหลังตอบทุกข้อ',
      startQuiz: 'เริ่มทำควิซ',
      features: [
        { icon: '📝', text: 'คำถามหลากหลายหมวด' },
        { icon: '📖', text: 'คำอธิบายละเอียดทุกข้อ' },
        { icon: '🏆', text: 'เก็บคะแนนและติดตามความก้าวหน้า' },
      ],
    },
    en: {
      title: 'Test Your Knowledge',
      subtitle: 'Test your understanding of Islamic practices',
      description: 'Answer questions and learn along the way with explanations for every answer',
      startQuiz: 'Start Quiz',
      features: [
        { icon: '📝', text: 'Various categories' },
        { icon: '📖', text: 'Detailed explanations' },
        { icon: '🏆', text: 'Track your progress' },
      ],
    }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  return (
    <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              🎯 {locale === 'th' ? 'ทดสอบตัวเอง' : 'Test Yourself'}
            </motion.span>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.title}
            </h2>
            <p className="text-xl text-white/80 mb-2">
              {t.subtitle}
            </p>
            <p className="text-white/60 mb-8">
              {t.description}
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {t.features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <Link href={`/${locale}/quiz`}>
              <motion.button
                className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.startQuiz} →
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Content - Quiz Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Quiz Card Preview */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500">{locale === 'th' ? 'ตัวอย่างคำถาม' : 'Sample Question'}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {locale === 'th' ? 'การละหมาด' : 'Salah'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {locale === 'th'
                  ? 'การละหมาดฟัรดูมีกี่เวลาต่อวัน?'
                  : 'How many obligatory prayers are there per day?'}
              </h3>

              <div className="space-y-3">
                {['3', '4', '5', '6'].map((answer, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${index === 2
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-purple-300'}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 2
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={index === 2 ? 'text-green-700 font-medium' : 'text-gray-700'}>
                        {answer} {locale === 'th' ? 'เวลา' : 'times'}
                      </span>
                      {index === 2 && (
                        <span className="ml-auto text-green-500">✓</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Explanation Preview */}
              <motion.div
                className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-purple-800">
                  <span className="font-bold">📖 {locale === 'th' ? 'คำอธิบาย:' : 'Explanation:'}</span>{' '}
                  {locale === 'th'
                    ? 'การละหมาดฟัรดู (บังคับ) มี 5 เวลา คือ ศุบฮิ, ซุฮฺริ, อัศริ, มัฆริบ และอิชาอฺ'
                    : 'There are 5 obligatory prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha'}
                </p>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🧠
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
