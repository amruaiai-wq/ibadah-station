'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Mock article data
const mockArticle = {
  id: '1',
  slug: 'importance-of-salah',
  title_th: 'ความสำคัญของการละหมาด',
  title_en: 'The Importance of Salah',
  excerpt_th: 'ละหมาดเป็นเสาหลักของศาสนาอิสลาม',
  excerpt_en: 'Salah is the pillar of Islam',
  content_th: `# ความสำคัญของการละหมาด

ละหมาดเป็นเสาหลักที่สำคัญที่สุดของอิสลาม หลังจากการกล่าวชะฮาดะฮ์ การละหมาดเป็นสิ่งแรกที่มุสลิมจะถูกถามในวันกิยามะฮ์

## หลักฐานจากอัลกุรอาน

อัลลอฮ์ ﷻ ตรัสว่า:

> إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا

**"แท้จริงการละหมาดนั้นเป็นสิ่งที่ถูกกำหนดเวลาไว้สำหรับบรรดาผู้ศรัทธา"**
(อัน-นิซาอ์ 4:103)

## ผลบุญของการละหมาด

การละหมาดมีผลบุญมากมาย ได้แก่:

1. **ลบล้างความผิด** - ท่านนบี ﷺ กล่าวว่า การละหมาด 5 เวลานั้นเปรียบเสมือนแม่น้ำที่ไหลผ่านหน้าบ้านของคนหนึ่ง ซึ่งเขาอาบน้ำในนั้นวันละ 5 ครั้ง

2. **นำมาซึ่งความสงบ** - การละหมาดเป็นการเชื่อมต่อระหว่างบ่าวกับพระผู้เป็นเจ้า ทำให้จิตใจสงบและได้รับความปิติยินดี

3. **ป้องกันจากความชั่ว** - อัลลอฮ์ตรัสว่า การละหมาดนั้นห้ามปรามจากการทำความชั่วและความผิด

## เวลาละหมาดทั้ง 5 เวลา

| เวลา | ชื่อ | ช่วงเวลา |
|------|------|----------|
| 1 | ศุบฮ์ (ฟัจร์) | หลังแสงอรุณ - ก่อนพระอาทิตย์ขึ้น |
| 2 | ซุฮ์ร์ | หลังเที่ยง - ก่อนอัศร์ |
| 3 | อัศร์ | บ่าย - ก่อนพระอาทิตย์ตก |
| 4 | มัฆริบ | หลังพระอาทิตย์ตก |
| 5 | อิชาอ์ | หลังแสงสนธยาหมด |

## สรุป

การละหมาดเป็นหัวใจของอิบาดะฮ์ในอิสลาม มุสลิมทุกคนควรให้ความสำคัญและรักษาการละหมาดให้ครบถ้วนตรงเวลา

---

*ขอให้อัลลอฮ์ทรงช่วยเหลือเราในการรักษาการละหมาด อามีน*`,
  content_en: `# The Importance of Salah

Salah is the most important pillar of Islam after the Shahada. It is the first thing a Muslim will be asked about on the Day of Judgment.

## Evidence from the Quran

Allah ﷻ says:

> إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا

**"Indeed, prayer has been decreed upon the believers a decree of specified times."**
(An-Nisa 4:103)

## Benefits of Salah

Salah has many benefits, including:

1. **Erases sins** - The Prophet ﷺ said that the five daily prayers are like a river flowing in front of one's house, in which he bathes five times a day.

2. **Brings peace** - Salah is a connection between the servant and the Lord, bringing tranquility and joy to the heart.

3. **Prevents evil** - Allah says that prayer prohibits immorality and wrongdoing.

## The Five Daily Prayers

| Time | Name | Period |
|------|------|--------|
| 1 | Fajr | After dawn - Before sunrise |
| 2 | Dhuhr | After noon - Before Asr |
| 3 | Asr | Afternoon - Before sunset |
| 4 | Maghrib | After sunset |
| 5 | Isha | After twilight ends |

## Conclusion

Salah is the heart of worship in Islam. Every Muslim should prioritize and maintain their prayers completely and on time.

---

*May Allah help us in maintaining our prayers. Ameen*`,
  category: 'salah',
  tags: ['salah', 'pillar', 'worship'],
  views: 1250,
  published_at: '2024-01-15',
};

export default function ArticlePage({ 
  params: { locale } 
}: { 
  params: { locale: string; slug: string } 
}) {
  const [article] = useState(mockArticle);

  const title = locale === 'th' ? article.title_th : article.title_en;
  const content = locale === 'th' ? article.content_th : article.content_en;

  const texts = {
    th: {
      back: 'กลับไปบทความ',
      share: 'แชร์',
      relatedArticles: 'บทความที่เกี่ยวข้อง',
    },
    en: {
      back: 'Back to articles',
      share: 'Share',
      relatedArticles: 'Related Articles',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  // Simple markdown renderer
  const renderMarkdown = (md: string) => {
    return md
      .split('\n\n')
      .map((block, i) => {
        // Headers
        if (block.startsWith('# ')) {
          return <h1 key={i} className="text-3xl font-bold text-gray-800 mb-6">{block.slice(2)}</h1>;
        }
        if (block.startsWith('## ')) {
          return <h2 key={i} className="text-2xl font-bold text-gray-800 mt-8 mb-4">{block.slice(3)}</h2>;
        }
        if (block.startsWith('### ')) {
          return <h3 key={i} className="text-xl font-bold text-gray-800 mt-6 mb-3">{block.slice(4)}</h3>;
        }

        // Blockquote
        if (block.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-4 border-gold pl-4 py-2 my-4 bg-gold/5 rounded-r-lg">
              <p className="text-2xl font-arabic text-right text-gray-700 leading-loose">
                {block.slice(2)}
              </p>
            </blockquote>
          );
        }

        // Horizontal rule
        if (block === '---') {
          return <hr key={i} className="my-8 border-gray-200" />;
        }

        // Table
        if (block.includes('|')) {
          const rows = block.split('\n').filter(row => !row.includes('---'));
          return (
            <div key={i} className="overflow-x-auto my-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    {rows[0].split('|').filter(Boolean).map((cell, j) => (
                      <th key={j} className="border border-primary-dark px-4 py-2 text-left">
                        {cell.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, j) => (
                    <tr key={j} className={j % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {row.split('|').filter(Boolean).map((cell, k) => (
                        <td key={k} className="border border-gray-200 px-4 py-2">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // List
        if (block.match(/^\d\./m)) {
          const items = block.split('\n').filter(Boolean);
          return (
            <ol key={i} className="list-decimal list-inside space-y-3 my-4">
              {items.map((item, j) => {
                const text = item.replace(/^\d\.\s*/, '');
                // Handle bold
                const parts = text.split(/\*\*(.*?)\*\*/);
                return (
                  <li key={j} className="text-gray-700">
                    {parts.map((part, k) => 
                      k % 2 === 1 ? <strong key={k} className="text-gray-900">{part}</strong> : part
                    )}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Italics paragraph
        if (block.startsWith('*') && block.endsWith('*')) {
          return <p key={i} className="text-gray-600 italic my-4">{block.slice(1, -1)}</p>;
        }

        // Bold text in paragraph
        if (block.includes('**')) {
          const parts = block.split(/\*\*(.*?)\*\*/);
          return (
            <p key={i} className="text-gray-700 leading-relaxed my-4">
              {parts.map((part, j) => 
                j % 2 === 1 ? <strong key={j} className="text-gray-900">{part}</strong> : part
              )}
            </p>
          );
        }

        // Regular paragraph
        return <p key={i} className="text-gray-700 leading-relaxed my-4">{block}</p>;
      });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-emerald-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href={`/${locale}/articles`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>{t.back}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                🕌 {article.category}
              </span>
              <span className="text-sm text-white/60">
                {new Date(article.published_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>👁 {article.views.toLocaleString()} views</span>
              <div className="flex gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="bg-white/10 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article 
            className="bg-white rounded-2xl shadow-sm p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="prose prose-lg max-w-none">
              {renderMarkdown(content)}
            </div>
          </motion.article>

          {/* Share Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="text-gray-500">{t.share}:</span>
            <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
              f
            </button>
            <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
              𝕏
            </button>
            <button className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
              ✉
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
