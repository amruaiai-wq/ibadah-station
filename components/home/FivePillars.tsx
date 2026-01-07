'use client';

import { motion } from 'framer-motion';

interface FivePillarsProps {
  locale: string;
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
    items: {
      shahada: { name: 'ชาฮาดะฮ์', arabic: 'الشهادة' },
      salah: { name: 'ละหมาด', arabic: 'الصلاة' },
      zakat: { name: 'ซะกาต', arabic: 'الزكاة' },
      sawm: { name: 'ถือศีลอด', arabic: 'الصوم' },
      hajj: { name: 'ฮัจญ์', arabic: 'الحج' },
    }
  },
  en: {
    title: 'The Five Pillars of Islam',
    titleArabic: 'أركان الإسلام الخمسة',
    subtitle: 'The foundation of Muslim life',
    items: {
      shahada: { name: 'Shahada', arabic: 'الشهادة' },
      salah: { name: 'Salah', arabic: 'الصلاة' },
      zakat: { name: 'Zakat', arabic: 'الزكاة' },
      sawm: { name: 'Sawm', arabic: 'الصوم' },
      hajj: { name: 'Hajj', arabic: 'الحج' },
    }
  }
};

export default function FivePillars({ locale }: FivePillarsProps) {
  const data = pillarData[locale as keyof typeof pillarData] || pillarData.th;

  return (
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
              const item = data.items[pillar.key as keyof typeof data.items];
              return (
                <motion.div
                  key={pillar.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center group"
                >
                  <motion.div
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-gold to-gold-light text-dark rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 shadow-lg relative z-10 cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 5 }}
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
