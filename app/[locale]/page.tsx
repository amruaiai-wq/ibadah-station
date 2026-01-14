import HeroSection from '@/components/home/HeroSection';
import PrayerTimes from '@/components/home/PrayerTimes';
import DailyWisdomNew from '@/components/home/DailyWisdomNew';
import JourneySection from '@/components/home/JourneySection';
import FivePillars from '@/components/home/FivePillars';
import QuizSection from '@/components/home/QuizSection';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <HeroSection locale={locale} />

      {/* Prayer Times */}
      <PrayerTimes locale={locale} />

      {/* Daily Wisdom - 3D Flip Card */}
      <DailyWisdomNew locale={locale} />

      {/* Journey Selection */}
      <JourneySection locale={locale} />

      {/* Five Pillars Section */}
      <FivePillars locale={locale} />

      {/* Quiz Section */}
      <QuizSection locale={locale} />

      {/* About Section */}
      <AboutSection locale={locale} />
    </div>
  );
}

function AboutSection({ locale }: { locale: string }) {
  const texts = {
    th: {
      title: 'เกี่ยวกับ Ibadah Station',
      description1: 'Ibadah Station คือแพลตฟอร์มเรียนรู้การปฏิบัติศาสนกิจในอิสลามแบบ Interactive ที่จะพาคุณเดินทางผ่านขั้นตอนต่างๆ อย่างเป็นระบบ ตั้งแต่การละหมาดประจำวัน ไปจนถึงการประกอบพิธีฮัจญ์และอุมเราะฮ์ ณ นครมักกะฮ์',
      description2: 'เนื้อหาทั้งหมดอ้างอิงจากอัลกุรอานและซุนนะฮ์ที่ถูกต้อง พร้อมคำอธิบายที่เข้าใจง่ายทั้งภาษาไทยและอังกฤษ',
    },
    en: {
      title: 'About Ibadah Station',
      description1: 'Ibadah Station is an interactive platform for learning Islamic worship. We guide you through systematic steps from daily prayers to performing Hajj and Umrah in Makkah.',
      description2: 'All content is referenced from the authentic Quran and Sunnah, with easy-to-understand explanations in both Thai and English.',
    }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  return (
    <section id="about" className="py-20 bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
          {t.title}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-4">
          {t.description1}
        </p>
        <p className="text-gray-600 text-lg leading-relaxed">
          {t.description2}
        </p>
      </div>
    </section>
  );
}
