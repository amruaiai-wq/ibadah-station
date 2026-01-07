'use client';

import Link from 'next/link';
import Image from 'next/image';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'th';

  const quickLinks = [
    { href: `/${locale}/journey/salah`, label: locale === 'th' ? 'การละหมาด' : 'Salah Prayer' },
    { href: `/${locale}/journey/umrah`, label: locale === 'th' ? 'อุมเราะฮ์' : 'Umrah' },
    { href: `/${locale}/articles`, label: locale === 'th' ? 'บทความ' : 'Articles' },
  ];

  return (
    <footer className="bg-gradient-to-br from-primary-dark to-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.jpg"
                alt="Ibadah Station Logo"
                width={56}
                height={56}
                className="rounded-full bg-white p-0.5"
              />
              <div>
                <div>
                  <span className="font-bold text-xl text-white">ibadah</span>
                  <span className="font-bold text-xl text-gold">station</span>
                  <span className="text-white/60 text-sm">.com</span>
                </div>
                <p className="text-white/60 text-sm">
                  {locale === 'th' ? 'สถานีแห่งอิบาดะฮ์' : 'Your Ibadah Journey'}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {locale === 'th' 
                ? 'แพลตฟอร์มเรียนรู้การปฏิบัติศาสนกิจในอิสลาม ด้วยขั้นตอนที่เข้าใจง่าย'
                : 'Learn Islamic worship practices with easy-to-follow steps'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gold">
              {locale === 'th' ? 'ลิงก์ด่วน' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gold">
              {locale === 'th' ? 'ติดต่อ' : 'Contact'}
            </h3>
            <div className="space-y-2 text-white/70 text-sm">
              <p>📧 contact@ibadahstation.com</p>
              <p>🌐 www.ibadahstation.com</p>
            </div>
            
            {/* Social */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-all">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-all">
                <span>📸</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-all">
                <span>🎵</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/50 text-sm">
            © 2024 Ibadah Station. {locale === 'th' ? 'สงวนลิขสิทธิ์' : 'All rights reserved.'}
          </p>
          <p className="text-gold/60 text-xs mt-2 font-arabic">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      </div>
    </footer>
  );
}
