/**
 * Prayer Times Utility
 * สำหรับคำนวณและดึงเวลาละหมาด
 */

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
      [key: string]: string;
    };
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;
        day: string;
        month: { number: number; en: string };
        year: string;
      };
      hijri: {
        date: string;
        day: string;
        month: { number: number; en: string; ar: string };
        year: string;
      };
    };
  };
}

export interface PrayerInfo {
  name: string;
  nameAr: string;
  nameTh: string;
  time: string;
  icon: string;
}

// Prayer names mapping
export const PRAYER_NAMES = {
  fajr: { en: 'Fajr', th: 'ฟัจร์', ar: 'الفجر', icon: '🌙' },
  sunrise: { en: 'Sunrise', th: 'ชุรูก', ar: 'الشروق', icon: '🌅' },
  dhuhr: { en: 'Dhuhr', th: 'ซุฮ์ริ', ar: 'الظهر', icon: '☀️' },
  asr: { en: 'Asr', th: 'อัสริ', ar: 'العصر', icon: '🌤️' },
  maghrib: { en: 'Maghrib', th: 'มัฆริบ', ar: 'المغرب', icon: '🌇' },
  isha: { en: 'Isha', th: 'อิชาอ์', ar: 'العشاء', icon: '🌃' },
} as const;

// Calculation methods
export const CALCULATION_METHODS = {
  1: 'University of Islamic Sciences, Karachi',
  2: 'Islamic Society of North America (ISNA)',
  3: 'Muslim World League',
  4: 'Umm Al-Qura University, Makkah',
  5: 'Egyptian General Authority of Survey',
  7: 'Institute of Geophysics, University of Tehran',
  8: 'Gulf Region',
  9: 'Kuwait',
  10: 'Qatar',
  11: 'Majlis Ugama Islam Singapura, Singapore',
  12: 'Union Organization Islamic de France',
  13: 'Diyanet İşleri Başkanlığı, Turkey',
  14: 'Spiritual Administration of Muslims of Russia',
  15: 'Moonsighting Committee Worldwide',
} as const;

/**
 * Fetch prayer times from Aladhan API
 */
export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  date?: Date,
  method: number = 3 // Default: Muslim World League
): Promise<PrayerTimes | null> {
  try {
    const targetDate = date || new Date();
    const dateStr = `${targetDate.getDate()}-${targetDate.getMonth() + 1}-${targetDate.getFullYear()}`;

    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`
    );

    if (!response.ok) {
      console.error('Aladhan API Error:', response.status);
      return null;
    }

    const data: PrayerTimesResponse = await response.json();

    if (data.code !== 200) {
      console.error('Aladhan API Error:', data.status);
      return null;
    }

    const timings = data.data.timings;

    return {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

/**
 * Get prayer times with full info
 */
export async function getPrayerTimesWithInfo(
  latitude: number,
  longitude: number,
  locale: 'th' | 'en' = 'th',
  date?: Date
): Promise<PrayerInfo[] | null> {
  const times = await fetchPrayerTimes(latitude, longitude, date);

  if (!times) {
    return null;
  }

  const prayers: (keyof typeof PRAYER_NAMES)[] = [
    'fajr',
    'sunrise',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  return prayers.map((prayer) => ({
    name: locale === 'th' ? PRAYER_NAMES[prayer].th : PRAYER_NAMES[prayer].en,
    nameAr: PRAYER_NAMES[prayer].ar,
    nameTh: PRAYER_NAMES[prayer].th,
    time: times[prayer],
    icon: PRAYER_NAMES[prayer].icon,
  }));
}

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if current time is within a time window
 */
export function isWithinTimeWindow(
  targetTime: string,
  currentTime: string,
  windowMinutes: number
): boolean {
  const targetMinutes = timeToMinutes(targetTime);
  const currentMinutes = timeToMinutes(currentTime);

  const diff = targetMinutes - currentMinutes;

  return diff >= 0 && diff <= windowMinutes;
}

/**
 * Get next prayer from current time
 */
export function getNextPrayer(
  prayerTimes: PrayerTimes,
  currentTime: string
): { prayer: keyof PrayerTimes; time: string } | null {
  const currentMinutes = timeToMinutes(currentTime);

  const prayers: (keyof PrayerTimes)[] = [
    'fajr',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  for (const prayer of prayers) {
    const prayerMinutes = timeToMinutes(prayerTimes[prayer]);
    if (prayerMinutes > currentMinutes) {
      return { prayer, time: prayerTimes[prayer] };
    }
  }

  // If all prayers have passed, next is Fajr (tomorrow)
  return { prayer: 'fajr', time: prayerTimes.fajr };
}

/**
 * Calculate time until prayer
 */
export function getTimeUntilPrayer(
  prayerTime: string,
  currentTime: string
): { hours: number; minutes: number } {
  const prayerMinutes = timeToMinutes(prayerTime);
  const currentMinutes = timeToMinutes(currentTime);

  let diff = prayerMinutes - currentMinutes;

  // If negative, prayer is tomorrow
  if (diff < 0) {
    diff += 24 * 60;
  }

  return {
    hours: Math.floor(diff / 60),
    minutes: diff % 60,
  };
}

/**
 * Get current time string in HH:mm format
 */
export function getCurrentTimeString(timezone: string = 'Asia/Bangkok'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(now);
}

/**
 * Get current hour in a specific timezone
 */
export function getCurrentHour(timezone: string = 'Asia/Bangkok'): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });

  return parseInt(formatter.format(now), 10);
}

/**
 * Check if it's time to send prayer notification
 * Returns the prayer name if it's time, null otherwise
 */
export function checkPrayerNotificationTime(
  prayerTimes: PrayerTimes,
  currentTime: string,
  reminderMinutes: number = 10,
  windowMinutes: number = 5
): (keyof PrayerTimes)[] {
  const prayers: (keyof PrayerTimes)[] = [
    'fajr',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  const currentMinutes = timeToMinutes(currentTime);
  const prayersToNotify: (keyof PrayerTimes)[] = [];

  for (const prayer of prayers) {
    const prayerMinutes = timeToMinutes(prayerTimes[prayer]);
    const notifyTime = prayerMinutes - reminderMinutes;

    // Check if current time is within the notification window
    const diff = currentMinutes - notifyTime;
    if (diff >= 0 && diff < windowMinutes) {
      prayersToNotify.push(prayer);
    }
  }

  return prayersToNotify;
}

/**
 * Get location name from coordinates using reverse geocoding
 */
export async function getLocationName(
  latitude: number,
  longitude: number,
  locale: string = 'th'
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${locale}`
    );

    if (!response.ok) {
      return locale === 'th' ? 'กรุงเทพฯ' : 'Bangkok';
    }

    const data = await response.json();
    return data.city || data.locality || data.countryName || (locale === 'th' ? 'กรุงเทพฯ' : 'Bangkok');
  } catch {
    return locale === 'th' ? 'กรุงเทพฯ' : 'Bangkok';
  }
}

/**
 * Format prayer time for display
 */
export function formatPrayerTime(time: string): string {
  return time; // Already in HH:mm format
}

/**
 * Get today's date string for Aladhan API
 */
export function getTodayDateString(): string {
  const today = new Date();
  return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
}
