'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface FivePillarsProps {
  locale: string;
}

interface PillarDetail {
  name: string;
  arabic: string;
  description: string;
  importance: string[];
  link?: string;
}

const pillars = [
  { key: 'shahada', icon: '☝️', number: 1 },
  { key: 'salah', icon: '🕌', number: 2 },
  { key: 'zakat', icon: '💎', number: 3 },
  { key: 'sawm', icon: '🌙', number: 4 },
  { key: 'hajj', icon: '🕋', number: 5 },
];

const pillarData = {
  th: {
    title: 'หลักการอิสลาม 5 ประการ',
    titleArabic: 'أركان الإسلام الخمسة',
    subtitle: 'รากฐานสำคัญของการเป็นมุสลิม',
    learnMore: 'เรียนรู้เพิ่มเติม',
    close: 'ปิด',
    items: {
      shahada: {
        name: 'ชาฮาดะฮ์',
        arabic: 'الشهادة',
        description: 'การปฏิญาณตนว่า "ไม่มีพระเจ้าอื่นใดนอกจากอัลลอฮ์ และมูฮัมหมัดเป็นศาสนทูตของอัลลอฮ์"',
        importance: [
          'เป็นประตูเข้าสู่อิสลาม',
          'ยืนยันความศรัทธาในพระเจ้าองค์เดียว',
          'ยอมรับท่านนบีมูฮัมหมัด ﷺ เป็นศาสนทูต',
          'เป็นพื้นฐานของหลักการอื่นๆ ทั้งหมด'
        ]
      },
      salah: {
        name: 'ละหมาด',
        arabic: 'الصلاة',
        description: 'การละหมาด 5 เวลาต่อวัน เป็นการเชื่อมต่อโดยตรงกับอัลลอฮ์',
        importance: [
          'เป็นเสาหลักของศาสนา',
          'ละหมาด 5 เวลา: ศุบฮ์ ซุฮรี อัศรี มัฆริบ อิชาอ์',
          'ชำระล้างจิตใจและเตือนสติ',
          'สร้างวินัยและความสม่ำเสมอ'
        ],
        link: '/journey/salah'
      },
      zakat: {
        name: 'ซะกาต',
        arabic: 'الزكاة',
        description: 'การบริจาคทานภาคบังคับ 2.5% ของทรัพย์สินที่ครบนิศอบ',
        importance: [
          'ชำระทรัพย์สินให้บริสุทธิ์',
          'ช่วยเหลือผู้ยากไร้ในสังคม',
          'ลดช่องว่างระหว่างคนรวยและคนจน',
          'เป็นการขอบคุณอัลลอฮ์สำหรับความมั่งคั่ง'
        ],
        link: '/journey/zakat'
      },
      sawm: {
        name: 'ถือศีลอด',
        arabic: 'الصوم',
        description: 'การถือศีลอดในเดือนรอมฎอน งดอาหาร เครื่องดื่ม และสิ่งต้องห้ามตั้งแต่แสงอรุณถึงดวงอาทิตย์ตก',
        importance: [
          'ฝึกความอดทนและควบคุมตนเอง',
          'รู้สึกถึงความหิวของผู้ยากไร้',
          'ชำระร่างกายและจิตใจ',
          'เพิ่มความใกล้ชิดกับอัลลอฮ์'
        ],
        link: '/journey/sawm'
      },
      hajj: {
        name: 'ฮัจญ์',
        arabic: 'الحج',
        description: 'การเดินทางไปประกอบพิธีฮัจญ์ที่มักกะฮ์ อย่างน้อยครั้งหนึ่งในชีวิตสำหรับผู้ที่สามารถ',
        importance: [
          'บังคับสำหรับผู้ที่มีความสามารถ',
          'รวมมุสลิมจากทั่วโลก',
          'ระลึกถึงท่านนบีอิบรอฮีม',
          'ลบล้างบาปทั้งหมดเมื่อทำอย่างถูกต้อง'
        ],
        link: '/journey/hajj'
      }
    } as Record<string, PillarDetail>
  },
  en: {
    title: 'The Five Pillars of Islam',
    titleArabic: 'أركان الإسلام الخمسة',
    subtitle: 'The foundation of Muslim life',
    learnMore: 'Learn More',
    close: 'Close',
    items: {
      shahada: {
        name: 'Shahada',
        arabic: 'الشهادة',
        description: 'Declaration of faith: "There is no god but Allah, and Muhammad is the Messenger of Allah"',
        importance: [
          'The gateway to Islam',
          'Affirms belief in one God',
          'Accepts Prophet Muhammad ﷺ as the messenger',
          'Foundation for all other pillars'
        ]
      },
      salah: {
        name: 'Salah',
        arabic: 'الصلاة',
        description: 'Five daily prayers as a direct connection to Allah',
        importance: [
          'The pillar of the religion',
          '5 prayers: Fajr, Dhuhr, Asr, Maghrib, Isha',
          'Purifies the soul and reminds us',
          'Builds discipline and consistency'
        ],
        link: '/journey/salah'
      },
      zakat: {
        name: 'Zakat',
        arabic: 'الزكاة',
        description: 'Obligatory charity of 2.5% of qualifying wealth',
        importance: [
          'Purifies wealth',
          'Helps the needy in society',
          'Reduces gap between rich and poor',
          'Shows gratitude to Allah for blessings'
        ],
        link: '/journey/zakat'
      },
      sawm: {
        name: 'Sawm',
        arabic: 'الصوم',
        description: 'Fasting during Ramadan from dawn to sunset',
        importance: [
          'Trains patience and self-control',
          'Experience hunger of the less fortunate',
          'Purifies body and soul',
          'Increases closeness to Allah'
        ],
        link: '/journey/sawm'
      },
      hajj: {
        name: 'Hajj',
        arabic: 'الحج',
        description: 'Pilgrimage to Makkah at least once in a lifetime for those able',
        importance: [
          'Obligatory for those who can afford it',
          'Unites Muslims from around the world',
          'Commemorates Prophet Ibrahim',
          'Erases all sins when performed correctly'
        ],
        link: '/journey/hajj'
      }
    } as Record<string, PillarDetail>
  }
};

export default function FivePillars({ locale }: FivePillarsProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const data = pillarData[locale as keyof typeof pillarData] || pillarData.th;

  const handlePillarClick = (key: string) => {
    setSelectedPillar(key);
  };

  const closeModal = () => {
    setSelectedPillar(null);
  };

  const selectedItem = selectedPillar ? data.items[selectedPillar] : null;
  const selectedPillarData = selectedPillar ? pillars.find(p => p.key === selectedPillar) : null;

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-primary-dark via-primary to-emerald-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {data.title}
            </h2>
            <p className="text-2xl font-arabic text-gold mb-4">
              {data.titleArabic}
            </p>
            <p className="text-white/70">
              {data.subtitle}
            </p>
          </motion.div>

          {/* Pillars */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gold/30 -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {pillars.map((pillar, index) => {
                const item = data.items[pillar.key];
                return (
                  <motion.div
                    key={pillar.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative text-center group cursor-pointer"
                    onClick={() => handlePillarClick(pillar.key)}
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto bg-gradient-to-br from-gold to-gold-light text-dark rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 shadow-lg relative z-10"
                      whileHover={{ scale: 1.15, rotate: 5, boxShadow: '0 0 30px rgba(197, 165, 114, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-primary rounded-full text-sm flex items-center justify-center font-bold shadow">
                        {pillar.number}
                      </span>
                      {pillar.icon}
                    </motion.div>

                    <h3 className="font-bold text-lg mb-1 group-hover:text-gold transition-colors">
                      {item.name}
                    </h3>
                    <p className="font-arabic text-gold text-xl">
                      {item.arabic}
                    </p>

                    {/* Click indicator */}
                    <motion.p
                      className="text-xs text-white/50 mt-2"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {locale === 'th' ? 'คลิกเพื่อดูรายละเอียด' : 'Click for details'}
                    </motion.p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedPillar && selectedItem && selectedPillarData && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 z-50"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white px-6 py-5 relative overflow-hidden">
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15L15 0zm0 5L5 15l10 10 10-10-10-10z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
                      }}
                    />
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-light text-dark rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-primary rounded-full text-xs flex items-center justify-center font-bold shadow">
                        {selectedPillarData.number}
                      </span>
                      {selectedPillarData.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                      <p className="text-xl font-arabic text-amber-300">{selectedItem.arabic}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                  {/* Description */}
                  <p className="text-gray-700 text-base leading-relaxed mb-6">
                    {selectedItem.description}
                  </p>

                  {/* Importance */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                      <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">✨</span>
                      {locale === 'th' ? 'ความสำคัญ' : 'Importance'}
                    </h3>
                    {selectedItem.importance.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 text-sm">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    {data.close}
                  </button>

                  {selectedItem.link && (
                    <Link
                      href={`/${locale}${selectedItem.link}`}
                      className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-200 transition-all flex items-center gap-2"
                      onClick={closeModal}
                    >
                      <span>{data.learnMore}</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
