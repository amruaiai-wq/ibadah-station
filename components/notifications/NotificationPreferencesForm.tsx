'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface NotificationPreferences {
  prayer_fajr: boolean;
  prayer_dhuhr: boolean;
  prayer_asr: boolean;
  prayer_maghrib: boolean;
  prayer_isha: boolean;
  prayer_reminder_minutes: number;
  adhkar_morning: boolean;
  adhkar_evening: boolean;
  daily_wisdom: boolean;
  quran_reminder: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  location_name: string;
}

interface NotificationPreferencesFormProps {
  locale: string;
}

const texts = {
  th: {
    title: 'ตั้งค่าการแจ้งเตือน',
    prayerTimes: 'แจ้งเตือนเวลาละหมาด',
    fajr: 'ฟัจร์',
    dhuhr: 'ซุฮ์ริ',
    asr: 'อัสริ',
    maghrib: 'มัฆริบ',
    isha: 'อิชาอ์',
    reminderBefore: 'แจ้งเตือนก่อนเวลาละหมาด',
    minutes: 'นาที',
    otherNotifications: 'การแจ้งเตือนอื่นๆ',
    morningAdhkar: 'อัซการเช้า (06:00)',
    eveningAdhkar: 'อัซการเย็น (17:00)',
    dailyWisdom: 'ข้อคิดประจำวัน (08:00)',
    quranReminder: 'เตือนอ่านอัลกุรอาน (20:00)',
    location: 'พื้นที่สำหรับคำนวณเวลาละหมาด',
    currentLocation: 'พื้นที่ปัจจุบัน',
    useMyLocation: 'ใช้ตำแหน่งของฉัน',
    detecting: 'กำลังตรวจจับตำแหน่ง...',
    save: 'บันทึก',
    saving: 'กำลังบันทึก...',
    saved: 'บันทึกแล้ว!',
    error: 'เกิดข้อผิดพลาด',
    loading: 'กำลังโหลด...',
    loginRequired: 'กรุณาเข้าสู่ระบบก่อน',
    connectLineFirst: 'กรุณาเชื่อมต่อ LINE ก่อนตั้งค่าการแจ้งเตือน',
  },
  en: {
    title: 'Notification Settings',
    prayerTimes: 'Prayer Time Notifications',
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    reminderBefore: 'Reminder before prayer time',
    minutes: 'minutes',
    otherNotifications: 'Other Notifications',
    morningAdhkar: 'Morning Adhkar (06:00)',
    eveningAdhkar: 'Evening Adhkar (17:00)',
    dailyWisdom: 'Daily Wisdom (08:00)',
    quranReminder: 'Quran Reminder (20:00)',
    location: 'Location for prayer time calculation',
    currentLocation: 'Current location',
    useMyLocation: 'Use my location',
    detecting: 'Detecting location...',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved!',
    error: 'An error occurred',
    loading: 'Loading...',
    loginRequired: 'Please login first',
    connectLineFirst: 'Please connect LINE first to set up notifications',
  },
};

const defaultPreferences: NotificationPreferences = {
  prayer_fajr: true,
  prayer_dhuhr: true,
  prayer_asr: true,
  prayer_maghrib: true,
  prayer_isha: true,
  prayer_reminder_minutes: 10,
  adhkar_morning: true,
  adhkar_evening: true,
  daily_wisdom: true,
  quran_reminder: true,
  latitude: 13.7563,
  longitude: 100.5018,
  timezone: 'Asia/Bangkok',
  location_name: 'Bangkok',
};

export default function NotificationPreferencesForm({
  locale,
}: NotificationPreferencesFormProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [hasLineConnection, setHasLineConnection] = useState(false);

  const t = texts[locale as keyof typeof texts] || texts.th;

  useEffect(() => {
    if (user) {
      fetchPreferences();
      checkLineConnection();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();

      if (!sessionData?.access_token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/notifications/preferences', {
        headers: {
          Authorization: `Bearer ${sessionData.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const checkLineConnection = async () => {
    try {
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();

      if (!sessionData?.access_token) return;

      const response = await fetch('/api/line/link', {
        headers: {
          Authorization: `Bearer ${sessionData.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasLineConnection(data.connected);
      }
    } catch (err) {
      console.error('Error checking LINE connection:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError(null);

      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();

      if (!sessionData?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.access_token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(t.error);
    } finally {
      setSaving(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Get location name
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${locale}`
          );
          const data = await response.json();
          const locationName =
            data.city || data.locality || data.countryName || 'Unknown';

          setPreferences((prev) => ({
            ...prev,
            latitude,
            longitude,
            location_name: locationName,
          }));
        } catch {
          setPreferences((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        }

        setDetectingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setDetectingLocation(false);
        setError('Could not detect location');
      }
    );
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-dark mb-4">{t.title}</h3>
        <p className="text-gray-500">{t.loginRequired}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-dark mb-4">{t.title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!hasLineConnection) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-dark mb-4">{t.title}</h3>
        <p className="text-gray-500">{t.connectLineFirst}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="text-xl font-bold text-dark mb-6">{t.title}</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Prayer Time Notifications */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
          <span>🕌</span> {t.prayerTimes}
        </h4>

        <div className="space-y-3">
          {[
            { key: 'prayer_fajr', label: t.fajr, icon: '🌙' },
            { key: 'prayer_dhuhr', label: t.dhuhr, icon: '☀️' },
            { key: 'prayer_asr', label: t.asr, icon: '🌤️' },
            { key: 'prayer_maghrib', label: t.maghrib, icon: '🌇' },
            { key: 'prayer_isha', label: t.isha, icon: '🌃' },
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{icon}</span>
                <span className="font-medium text-gray-700">{label}</span>
              </span>
              <input
                type="checkbox"
                checked={preferences[key as keyof NotificationPreferences] as boolean}
                onChange={() => handleToggle(key as keyof NotificationPreferences)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
          ))}
        </div>

        {/* Reminder time */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.reminderBefore}
          </label>
          <div className="flex items-center gap-2">
            <select
              value={preferences.prayer_reminder_minutes}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  prayer_reminder_minutes: parseInt(e.target.value),
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
            <span className="text-gray-600">{t.minutes}</span>
          </div>
        </div>
      </div>

      {/* Other Notifications */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
          <span>🔔</span> {t.otherNotifications}
        </h4>

        <div className="space-y-3">
          {[
            { key: 'adhkar_morning', label: t.morningAdhkar, icon: '🌅' },
            { key: 'adhkar_evening', label: t.eveningAdhkar, icon: '🌆' },
            { key: 'daily_wisdom', label: t.dailyWisdom, icon: '✨' },
            { key: 'quran_reminder', label: t.quranReminder, icon: '📖' },
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{icon}</span>
                <span className="font-medium text-gray-700">{label}</span>
              </span>
              <input
                type="checkbox"
                checked={preferences[key as keyof NotificationPreferences] as boolean}
                onChange={() => handleToggle(key as keyof NotificationPreferences)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
          <span>📍</span> {t.location}
        </h4>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">{t.currentLocation}</p>
          <p className="text-lg font-semibold text-dark mb-4">
            {preferences.location_name}
          </p>

          <button
            onClick={detectLocation}
            disabled={detectingLocation}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {detectingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                {t.detecting}
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t.useMyLocation}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 px-4 font-medium rounded-xl transition-colors ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-primary hover:bg-primary-dark text-white'
        } disabled:opacity-50`}
      >
        {saving ? t.saving : saved ? t.saved : t.save}
      </button>
    </motion.div>
  );
}
