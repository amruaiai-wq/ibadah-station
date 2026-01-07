'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface JourneyCardProps {
  type: 'salah' | 'zakat' | 'sawm' | 'hajj' | 'umrah' | 'adhkar';
  locale: string;
  disabled?: boolean;
}

const cardConfig = {
  salah: { icon: '🕌', gradient: 'from-emerald-600 to-emerald-800' },
  zakat: { icon: '💰', gradient: 'from-amber-600 to-amber-800' },
  sawm: { icon: '🌙', gradient: 'from-indigo-600 to-indigo-800' },
  hajj: { icon: '🕋', gradient: 'from-stone-600 to-stone-800' },
  umrah: { icon: '✨', gradient: 'from-teal-600 to-teal-800' },
  adhkar: { icon: '📿', gradient: 'from-cyan-600 to-cyan-800' },
};

export default function JourneyCard({ type, locale, disabled = false }: JourneyCardProps) {
  const t = useTranslations('cards');
  const config = cardConfig[type];

  const CardContent = () => (
    <>
      <div className={`bg-gradient-to-br ${config.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <span className="text-4xl">{config.icon}</span>
          {disabled && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              เร็วๆ นี้
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mt-4">{t(`${type}.title`)}</h3>
        <p className="text-2xl font-arabic mt-1 opacity-90">{t(`${type}.arabic`)}</p>
      </div>

      <div className="p-6">
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {t(`${type}.description`)}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(t.raw(`${type}.steps`) as string[]).slice(0, 4).map((step, index) => (
            <span
              key={index}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
            >
              {step}
            </span>
          ))}
          {(t.raw(`${type}.steps`) as string[]).length > 4 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              +{(t.raw(`${type}.steps`) as string[]).length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-primary'}`}>
            {disabled ? 'เร็วๆ นี้' : 'เรียนรู้เพิ่มเติม'}
          </span>
          {!disabled && (
            <span className="text-primary text-xl">→</span>
          )}
        </div>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className="journey-card bg-white rounded-2xl shadow-lg overflow-hidden opacity-60 cursor-not-allowed">
        <CardContent />
      </div>
    );
  }

  return (
    <Link href={`/${locale}/journey/${type}`}>
      <div className="journey-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer">
        <CardContent />
      </div>
    </Link>
  );
}
