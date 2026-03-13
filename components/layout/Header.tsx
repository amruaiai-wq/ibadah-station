'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import UserMenu from '@/components/auth/UserMenu';

interface HeaderProps {
  locale: string;
}

const journeyCategories = (locale: string) => [
  {
    label: locale === 'th' ? 'เสาหลักทั้งห้า' : 'Five Pillars',
    icon: '🕌',
    items: [
      { href: `/${locale}/journey/salah`, label: locale === 'th' ? 'ละหมาด' : 'Salah', icon: '🕌' },
      { href: `/${locale}/journey/umrah`, label: locale === 'th' ? 'อุมเราะห์' : 'Umrah', icon: '🕋' },
      { href: `/${locale}/journey/hajj`, label: locale === 'th' ? 'หัจญ์' : 'Hajj', icon: '🏔️' },
      { href: `/${locale}/journey/zakat`, label: locale === 'th' ? 'ซะกาต' : 'Zakat', icon: '💎' },
      { href: `/${locale}/journey/sawm`, label: locale === 'th' ? 'ถือศีลอด' : 'Sawm', icon: '🌙' },
    ],
  },
  {
    label: locale === 'th' ? 'ความรู้พื้นฐาน' : 'Foundational Knowledge',
    icon: '📚',
    items: [
      { href: `/${locale}/journey/water-types`, label: locale === 'th' ? 'ประเภทของน้ำ' : 'Water Types', icon: '💧' },
      { href: `/${locale}/journey/najis-types`, label: locale === 'th' ? 'ประเภทของนะญิส' : 'Najis Types', icon: '⚠️' },
      { href: `/${locale}/journey/daily-sunnah`, label: locale === 'th' ? 'ซุนนะห์ประจำวัน' : 'Daily Sunnah', icon: '☀️' },
    ],
  },
  {
    label: locale === 'th' ? 'อาคิเราะห์' : 'Akhirat',
    icon: '⚖️',
    items: [
      { href: `/${locale}/journey/day-of-judgment`, label: locale === 'th' ? 'วันกิยามะห์' : 'Day of Judgment', icon: '⚖️' },
      { href: `/${locale}/journey/jannah`, label: locale === 'th' ? 'สวรรค์' : 'Jannah', icon: '🏡' },
      { href: `/${locale}/journey/jahannam`, label: locale === 'th' ? 'นรก' : 'Jahannam', icon: '🔥' },
    ],
  },
  {
    label: locale === 'th' ? 'เข้าใจอิสลาม' : 'Understanding Islam',
    icon: '❓',
    items: [
      { href: `/${locale}/journey/islam-faq`, label: locale === 'th' ? 'คำถามที่พบบ่อย' : 'Islam FAQ', icon: '❓' },
    ],
  },
  {
    label: locale === 'th' ? 'ประวัติศาสตร์อิสลาม' : 'Islamic History',
    icon: '☪️',
    items: [
      { href: `/${locale}/journey/prophet-biography`, label: locale === 'th' ? 'ชีวประวัตินบี ﷺ' : 'Prophet Biography', icon: '☪️' },
      { href: `/${locale}/journey/islamic-battles`, label: locale === 'th' ? 'สงครามในอิสลาม' : 'Islamic Battles', icon: '⚔️' },
    ],
  },
  {
    label: locale === 'th' ? 'ฟิกฮ์เปรียบเทียบ' : 'Comparative Fiqh',
    icon: '📖',
    items: [
      { href: `/${locale}/journey/comparative-fiqh`, label: locale === 'th' ? 'เปรียบเทียบ 4 มัษฮับ' : 'Compare 4 Madhabs', icon: '📖' },
    ],
  },
];

const azkarItems = (locale: string) => [
  { href: `/${locale}/journey/post-prayer-adhkar`, label: locale === 'th' ? 'อัซการ์หลังละหมาด' : 'Post-Prayer Adhkar', icon: '📿' },
  { href: `/${locale}/journey/morning-evening-adhkar`, label: locale === 'th' ? 'อัซการ์เช้า-เย็น' : 'Morning & Evening Adhkar', icon: '🌅' },
  { href: `/${locale}/journey/daily-duas`, label: locale === 'th' ? 'ดุอาอ์ประจำวัน' : 'Daily Duas', icon: '🤲' },
];

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJourneysOpen, setIsJourneysOpen] = useState(false);
  const [isAzkarOpen, setIsAzkarOpen] = useState(false);
  const [mobileJourneysOpen, setMobileJourneysOpen] = useState(false);
  const [mobileAzkarOpen, setMobileAzkarOpen] = useState(false);

  const journeysRef = useRef<HTMLDivElement>(null);
  const azkarRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (journeysRef.current && !journeysRef.current.contains(e.target as Node)) {
        setIsJourneysOpen(false);
      }
      if (azkarRef.current && !azkarRef.current.contains(e.target as Node)) {
        setIsAzkarOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setIsLangOpen(false);
  };

  const userMenuTranslations = {
    login: locale === 'th' ? 'เข้าสู่ระบบ' : 'Login',
    register: locale === 'th' ? 'สมัครสมาชิก' : 'Register',
    profile: locale === 'th' ? 'โปรไฟล์' : 'Profile',
    myQuestions: locale === 'th' ? 'คำถามของฉัน' : 'My Questions',
    logout: locale === 'th' ? 'ออกจากระบบ' : 'Logout',
  };

  const categories = journeyCategories(locale);
  const azkar = azkarItems(locale);

  return (
    <header className="bg-gradient-to-r from-primary to-primary-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="font-bold text-xl text-white">ibadah</span>
            <span className="font-bold text-xl text-gold">station</span>
            <span className="text-white/60 text-sm">.com</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}`} className="hover:text-gold transition-colors text-sm">
              {t('nav.home')}
            </Link>

            {/* Journeys Dropdown */}
            <div className="relative" ref={journeysRef}>
              <button
                onClick={() => { setIsJourneysOpen(!isJourneysOpen); setIsAzkarOpen(false); }}
                className="flex items-center gap-1 hover:text-gold transition-colors text-sm"
              >
                {locale === 'th' ? 'เส้นทาง' : 'Journeys'}
                <svg className={`w-3.5 h-3.5 transition-transform ${isJourneysOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isJourneysOpen && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down z-50" style={{ width: '560px' }}>
                  <div className="grid grid-cols-2 gap-0 p-3">
                    {categories.map((cat) => (
                      <div key={cat.label} className="p-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1 flex items-center gap-1">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                        {cat.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsJourneysOpen(false)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary/10 text-dark transition-colors text-sm"
                          >
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
                    <Link
                      href={`/${locale}#journeys`}
                      onClick={() => setIsJourneysOpen(false)}
                      className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      {locale === 'th' ? 'ดูทั้งหมด →' : 'View all journeys →'}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Azkar Dropdown */}
            <div className="relative" ref={azkarRef}>
              <button
                onClick={() => { setIsAzkarOpen(!isAzkarOpen); setIsJourneysOpen(false); }}
                className="flex items-center gap-1 hover:text-gold transition-colors text-sm"
              >
                <span>📿</span>
                {locale === 'th' ? 'อัซการ์' : 'Azkar'}
                <svg className={`w-3.5 h-3.5 transition-transform ${isAzkarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAzkarOpen && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down z-50 min-w-[240px]">
                  <div className="p-2">
                    {azkar.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsAzkarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 text-dark transition-colors"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href={`/${locale}/quran`} className="hover:text-gold transition-colors text-sm">
              {locale === 'th' ? 'อัลกุรอาน' : 'Quran'}
            </Link>
            <Link href={`/${locale}/quiz`} className="hover:text-gold transition-colors text-sm">
              {locale === 'th' ? 'ควิซ' : 'Quiz'}
            </Link>
            <Link href={`/${locale}/qna`} className="hover:text-gold transition-colors text-sm">
              {locale === 'th' ? 'ถาม-ตอบ' : 'Q&A'}
            </Link>
          </nav>

          {/* User Menu & Language Switcher */}
          <div className="flex items-center gap-3">
            <UserMenu locale={locale} translations={userMenuTranslations} />

            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors flex items-center justify-center text-lg"
                title={locale === 'th' ? 'เปลี่ยนภาษา' : 'Change language'}
              >
                {locale === 'th' ? '🇹🇭' : '🇬🇧'}
              </button>

              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[120px] animate-slide-down z-50">
                  <button
                    onClick={() => switchLocale('th')}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-dark ${locale === 'th' ? 'bg-primary/10' : ''}`}
                  >
                    <span className="text-lg">🇹🇭</span>
                    <span className="text-sm font-medium">ไทย</span>
                  </button>
                  <button
                    onClick={() => switchLocale('en')}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-dark ${locale === 'en' ? 'bg-primary/10' : ''}`}
                  >
                    <span className="text-lg">🇬🇧</span>
                    <span className="text-sm font-medium">EN</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-white/20 animate-slide-down space-y-1">
            <Link
              href={`/${locale}`}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>

            {/* Mobile Journeys */}
            <div>
              <button
                onClick={() => setMobileJourneysOpen(!mobileJourneysOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span>{locale === 'th' ? 'เส้นทาง' : 'Journeys'}</span>
                <svg className={`w-4 h-4 transition-transform ${mobileJourneysOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileJourneysOpen && (
                <div className="ml-3 mt-1 space-y-3 border-l border-white/20 pl-3">
                  {categories.map((cat) => (
                    <div key={cat.label}>
                      <div className="text-xs font-semibold text-white/50 uppercase tracking-wide py-1 flex items-center gap-1">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      {cat.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-1.5 hover:text-gold transition-colors text-sm"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Azkar */}
            <div>
              <button
                onClick={() => setMobileAzkarOpen(!mobileAzkarOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span>📿</span>
                  {locale === 'th' ? 'อัซการ์' : 'Azkar'}
                </span>
                <svg className={`w-4 h-4 transition-transform ${mobileAzkarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileAzkarOpen && (
                <div className="ml-3 mt-1 border-l border-white/20 pl-3 space-y-1">
                  {azkar.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-1.5 hover:text-gold transition-colors text-sm"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/${locale}/quran`}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {locale === 'th' ? 'อัลกุรอาน' : 'Quran'}
            </Link>
            <Link
              href={`/${locale}/quiz`}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {locale === 'th' ? 'ควิซ' : 'Quiz'}
            </Link>
            <Link
              href={`/${locale}/qna`}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {locale === 'th' ? 'ถาม-ตอบ' : 'Q&A'}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
