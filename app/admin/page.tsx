'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock stats data
const mockStats = {
  today: {
    views: 245,
    visitors: 89,
    change: '+12%',
  },
  week: {
    views: 1580,
    visitors: 523,
    change: '+8%',
  },
  month: {
    views: 6240,
    visitors: 2105,
    change: '+15%',
  },
  topPages: [
    { path: '/th', views: 450, label: 'หน้าแรก' },
    { path: '/th/journey/salah', views: 320, label: 'การละหมาด' },
    { path: '/th/journey/umrah', views: 280, label: 'อุมเราะฮ์' },
    { path: '/th/articles', views: 180, label: 'บทความ' },
    { path: '/en', views: 120, label: 'Home (EN)' },
  ],
  dailyData: [
    { date: '1 ธ.ค.', views: 180, visitors: 65 },
    { date: '2 ธ.ค.', views: 220, visitors: 78 },
    { date: '3 ธ.ค.', views: 195, visitors: 71 },
    { date: '4 ธ.ค.', views: 240, visitors: 85 },
    { date: '5 ธ.ค.', views: 310, visitors: 112 },
    { date: '6 ธ.ค.', views: 280, visitors: 95 },
    { date: '7 ธ.ค.', views: 245, visitors: 89 },
  ],
  content: {
    wisdom: 6,
    articles: 4,
    journeys: 2,
  }
};

export default function AdminDashboard() {
  const [stats] = useState(mockStats);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const currentStats = stats[period];
  const maxViews = Math.max(...stats.dailyData.map(d => d.views));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p className="text-gray-500 mt-1">ภาพรวมสถิติของเว็บไซต์</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['today', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${period === p 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'}
            `}
          >
            {p === 'today' ? 'วันนี้' : p === 'week' ? '7 วัน' : '30 วัน'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">👁</span>
            <span className="text-green-500 text-sm font-medium">{currentStats.change}</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-4">{currentStats.views.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Page Views</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">👤</span>
            <span className="text-green-500 text-sm font-medium">{currentStats.change}</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-4">{currentStats.visitors.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Unique Visitors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <span className="text-3xl">✨</span>
          <p className="text-3xl font-bold text-gray-800 mt-4">{stats.content.wisdom}</p>
          <p className="text-gray-500 text-sm">ข้อคิดประจำวัน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <span className="text-3xl">📝</span>
          <p className="text-3xl font-bold text-gray-800 mt-4">{stats.content.articles}</p>
          <p className="text-gray-500 text-sm">บทความ</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">📈 Traffic (7 วันล่าสุด)</h2>
          
          <div className="space-y-4">
            {stats.dailyData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">{day.date}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(day.views / maxViews) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-16 text-right">
                  {day.views}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">🔥 หน้ายอดนิยม</h2>
          
          <div className="space-y-4">
            {stats.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{page.label}</p>
                    <p className="text-xs text-gray-400">{page.path}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {page.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white"
      >
        <h2 className="text-lg font-bold mb-4">⚡ Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/wisdom"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <span>✨</span>
            <span>เพิ่มข้อคิดประจำวัน</span>
          </a>
          <a
            href="/admin/articles"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <span>📝</span>
            <span>เขียนบทความใหม่</span>
          </a>
          <a
            href="/th"
            target="_blank"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <span>🌐</span>
            <span>ดูเว็บไซต์</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
