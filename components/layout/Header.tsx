'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
// import DonateButton from '@/components/donate/DonateButton';
import UserMenu from '@/components/auth/UserMenu';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setIsLangOpen(false);
  };

  const navItems = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}#journeys`, label: t('nav.journeys') },
    { href: `/${locale}/quran`, label: locale === 'th' ? 'อัลกุรอาน' : 'Quran' },
    { href: `/${locale}/quiz`, label: locale === 'th' ? 'ควิซ' : 'Quiz' },
    { href: `/${locale}/qna`, label: locale === 'th' ? 'ถาม-ตอบ' : 'Q&A' },
  ];

  const userMenuTranslations = {
    login: locale === 'th' ? 'เข้าสู่ระบบ' : 'Login',
    register: locale === 'th' ? 'สมัครสมาชิก' : 'Register',
    profile: locale === 'th' ? 'โปรไฟล์' : 'Profile',
    myQuestions: locale === 'th' ? 'คำถามของฉัน' : 'My Questions',
    logout: locale === 'th' ? 'ออกจากระบบ' : 'Logout',
  };

  return (
    <header className="bg-gradient-to-r from-primary to-primary-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ibadah Station Logo"
              width={44}
              height={44}
              className="rounded-full"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-white">ibadah</span>
              <span className="font-bold text-xl text-gold">station</span>
              <span className="text-white/60 text-sm">.com</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className="hover:text-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Donate Button - Desktop (Hidden for now) */}
            {/* <div className="hidden md:block">
              <DonateButton locale={locale} />
            </div> */}

            {/* User Menu */}
            <UserMenu locale={locale} translations={userMenuTranslations} />

            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors flex items-center justify-center text-lg"
                title={locale === 'th' ? 'เปลี่ยนภาษา' : 'Change language'}
              >
                {locale === 'th' ? '🇹🇭' : '🇬🇧'}
              </button>

              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[120px] animate-slide-down">
                  <button
                    onClick={() => switchLocale('th')}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-dark ${
                      locale === 'th' ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="text-lg">🇹🇭</span>
                    <span className="text-sm font-medium">ไทย</span>
                  </button>
                  <button
                    onClick={() => switchLocale('en')}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-dark ${
                      locale === 'en' ? 'bg-primary/10' : ''
                    }`}
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
          <nav className="md:hidden py-4 border-t border-white/20 animate-slide-down">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 hover:text-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Donate Button - Mobile (Hidden for now) */}
            {/* <div className="pt-3 mt-3 border-t border-white/20">
              <DonateButton locale={locale} />
            </div> */}
          </nav>
        )}
      </div>
    </header>
  );
}
