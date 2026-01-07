'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PrayerTimesProps {
  locale: string;
}

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  icon: string;
}

interface PrayerData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimes({ locale }: PrayerTimesProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');

  const texts = {
    th: {
      title: 'เวลาละหมาดวันนี้',
      fajr: 'ฟัจร์',
      sunrise: 'ชุรูก',
      dhuhr: 'ซุฮ์ริ',
      asr: 'อัสริ',
      maghrib: 'มัฆริบ',
      isha: 'อิชาอ์',
      next: 'ละหมาดถัดไป',
      loading: 'กำลังโหลด...',
      locationError: 'ไม่สามารถระบุตำแหน่งได้',
    },
    en: {
      title: "Today's Prayer Times",
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      next: 'Next Prayer',
      loading: 'Loading...',
      locationError: 'Could not determine location',
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.th;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch prayer times based on location
  useEffect(() => {
    const fetchPrayerTimes = async (latitude: number, longitude: number) => {
      try {
        const date = new Date();
        const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=3`
        );
        const data = await response.json();

        if (data.code === 200) {
          const timings: PrayerData = data.data.timings;

          const prayers: PrayerTime[] = [
            { name: t.fajr, nameAr: 'الفجر', time: timings.Fajr, icon: '🌙' },
            { name: t.sunrise, nameAr: 'الشروق', time: timings.Sunrise, icon: '🌅' },
            { name: t.dhuhr, nameAr: 'الظهر', time: timings.Dhuhr, icon: '☀️' },
            { name: t.asr, nameAr: 'العصر', time: timings.Asr, icon: '🌤️' },
            { name: t.maghrib, nameAr: 'المغرب', time: timings.Maghrib, icon: '🌇' },
            { name: t.isha, nameAr: 'العشاء', time: timings.Isha, icon: '🌃' },
          ];

          setPrayerTimes(prayers);
          calculateNextPrayer(prayers);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Get location name
            try {
              const geoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${locale}`
              );
              const geoData = await geoResponse.json();
              setLocationName(geoData.city || geoData.locality || geoData.countryName || '');
            } catch {
              // Ignore geo error
            }

            fetchPrayerTimes(latitude, longitude);
          },
          () => {
            // Default to Bangkok if location access denied
            setLocationName(locale === 'th' ? 'กรุงเทพฯ' : 'Bangkok');
            fetchPrayerTimes(13.7563, 100.5018);
          }
        );
      } else {
        // Default to Bangkok
        setLocationName(locale === 'th' ? 'กรุงเทพฯ' : 'Bangkok');
        fetchPrayerTimes(13.7563, 100.5018);
      }
    };

    getLocation();
  }, [locale, t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha]);

  const calculateNextPrayer = (prayers: PrayerTime[]) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer.name);
        return;
      }
    }
    // If all prayers passed, next is Fajr
    setNextPrayer(prayers[0]?.name || '');
  };

  useEffect(() => {
    if (prayerTimes.length > 0) {
      calculateNextPrayer(prayerTimes);
    }
  }, [currentTime, prayerTimes]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-cream to-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-cream to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-2">
            🕌 {t.title}
          </h2>
          {locationName && (
            <p className="text-gray-500 flex items-center justify-center gap-2">
              <span>📍</span>
              <span>{locationName}</span>
            </p>
          )}
        </motion.div>

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {prayerTimes.map((prayer, index) => {
            const isNext = prayer.name === nextPrayer;

            return (
              <motion.div
                key={prayer.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-4 text-center transition-all duration-300 ${
                  isNext
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white shadow-md hover:shadow-lg hover:scale-102'
                }`}
              >
                {isNext && (
                  <div className="absolute -top-2 -right-2 bg-gold text-dark text-xs font-bold px-2 py-1 rounded-full">
                    {t.next}
                  </div>
                )}

                <div className="text-3xl mb-2">{prayer.icon}</div>

                <p className={`font-arabic text-lg mb-1 ${isNext ? 'text-gold' : 'text-primary'}`}>
                  {prayer.nameAr}
                </p>

                <p className={`font-semibold ${isNext ? 'text-white' : 'text-dark'}`}>
                  {prayer.name}
                </p>

                <p className={`text-2xl font-bold mt-2 ${isNext ? 'text-white' : 'text-primary'}`}>
                  {prayer.time}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Current Time */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-gray-500"
        >
          <p>
            🕐 {currentTime.toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
