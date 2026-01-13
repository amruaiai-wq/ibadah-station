'use client';

import { motion } from 'framer-motion';
import JourneyCardNew from './JourneyCardNew';

interface JourneySectionProps {
  locale: string;
}

export default function JourneySection({ locale }: JourneySectionProps) {
  const texts = {
    th: {
      title: 'เลือกการเดินทางของคุณ',
      subtitle: 'เรียนรู้การปฏิบัติศาสนกิจทีละขั้นตอน ด้วยคำอธิบายที่เข้าใจง่าย',
      knowledgeTitle: 'ความรู้พื้นฐาน',
      knowledgeSubtitle: 'เรียนรู้หลักการสำคัญก่อนปฏิบัติ',
      akhirahTitle: 'โลกหน้า (อาคิเราะฮ์)',
      akhirahSubtitle: 'เรียนรู้เกี่ยวกับชีวิตหลังความตายตามหลักอิสลาม',
    },
    en: {
      title: 'Choose Your Journey',
      subtitle: 'Learn Islamic practices step by step with easy-to-understand explanations',
      knowledgeTitle: 'Foundational Knowledge',
      knowledgeSubtitle: 'Learn essential principles before practice',
      akhirahTitle: 'The Hereafter (Akhirah)',
      akhirahSubtitle: 'Learn about life after death in Islam',
    }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="journeys" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            🚀 {locale === 'th' ? 'เริ่มต้นที่นี่' : 'Start Here'}
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Journey Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="salah" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="umrah" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="hajj" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="sawm" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="zakat" locale={locale} progress={0} />
          </motion.div>
        </motion.div>

        {/* Knowledge Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20 mb-12"
        >
          <motion.span
            className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-600 rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            📚 {t.knowledgeTitle}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
            {t.knowledgeTitle}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.knowledgeSubtitle}
          </p>
        </motion.div>

        {/* Knowledge Journey Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="water-types" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="najis-types" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="post-prayer-adhkar" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="morning-evening-adhkar" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="daily-duas" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="daily-sunnah" locale={locale} progress={0} />
          </motion.div>
        </motion.div>

        {/* Akhirah Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20 mb-12"
        >
          <motion.span
            className="inline-block px-4 py-2 bg-slate-500/10 text-slate-600 rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            ⚖️ {t.akhirahTitle}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
            {t.akhirahTitle}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.akhirahSubtitle}
          </p>
        </motion.div>

        {/* Akhirah Journey Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="day-of-judgment" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="jannah" locale={locale} progress={0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <JourneyCardNew type="jahannam" locale={locale} progress={0} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
