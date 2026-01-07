'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Wisdom {
  id: string;
  arabic: string;
  transliteration: string;
  meaning_th: string;
  meaning_en: string;
  source: string;
  source_detail: string;
  is_active: boolean;
  display_date: string | null;
}

const mockWisdoms: Wisdom[] = [
  {
    id: '1',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    transliteration: "Inna ma'al usri yusra",
    meaning_th: 'แท้จริงพร้อมกับความยากลำบากนั้นมีความง่ายดาย',
    meaning_en: 'Indeed, with hardship comes ease',
    source: 'Quran',
    source_detail: 'Surah Ash-Sharh 94:6',
    is_active: true,
    display_date: null,
  },
  {
    id: '2',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    transliteration: "Innamal a'malu binniyyat",
    meaning_th: 'แท้จริงการงานทั้งหลายขึ้นอยู่กับเจตนา',
    meaning_en: 'Actions are judged by intentions',
    source: 'Hadith',
    source_detail: 'Sahih Bukhari & Muslim',
    is_active: true,
    display_date: null,
  },
];

export default function WisdomAdminPage() {
  const [wisdoms, setWisdoms] = useState<Wisdom[]>(mockWisdoms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWisdom, setEditingWisdom] = useState<Wisdom | null>(null);
  const [formData, setFormData] = useState({
    arabic: '',
    transliteration: '',
    meaning_th: '',
    meaning_en: '',
    source: 'Quran',
    source_detail: '',
    is_active: true,
    display_date: '',
  });

  const openModal = (wisdom?: Wisdom) => {
    if (wisdom) {
      setEditingWisdom(wisdom);
      setFormData({
        arabic: wisdom.arabic,
        transliteration: wisdom.transliteration,
        meaning_th: wisdom.meaning_th,
        meaning_en: wisdom.meaning_en,
        source: wisdom.source,
        source_detail: wisdom.source_detail,
        is_active: wisdom.is_active,
        display_date: wisdom.display_date || '',
      });
    } else {
      setEditingWisdom(null);
      setFormData({
        arabic: '',
        transliteration: '',
        meaning_th: '',
        meaning_en: '',
        source: 'Quran',
        source_detail: '',
        is_active: true,
        display_date: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWisdom) {
      setWisdoms(wisdoms.map(w => 
        w.id === editingWisdom.id ? { ...w, ...formData, display_date: formData.display_date || null } : w
      ));
    } else {
      const newWisdom: Wisdom = {
        id: Date.now().toString(),
        ...formData,
        display_date: formData.display_date || null,
      };
      setWisdoms([...wisdoms, newWisdom]);
    }
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setWisdoms(wisdoms.map(w => 
      w.id === id ? { ...w, is_active: !w.is_active } : w
    ));
  };

  const deleteWisdom = (id: string) => {
    if (confirm('ต้องการลบข้อมูลนี้?')) {
      setWisdoms(wisdoms.filter(w => w.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">✨ ข้อคิดประจำวัน</h1>
          <p className="text-gray-500 mt-1">จัดการข้อคิดที่แสดงบนหน้าแรก</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>เพิ่มใหม่</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {wisdoms.map((wisdom, index) => (
          <motion.div
            key={wisdom.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${wisdom.is_active ? 'border-primary' : 'border-gray-300'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-2xl font-arabic text-gray-800 mb-2">{wisdom.arabic}</p>
                <p className="text-gray-600 italic mb-2">&ldquo;{wisdom.transliteration}&rdquo;</p>
                <p className="text-gray-800 font-medium mb-1">{wisdom.meaning_th}</p>
                <p className="text-gray-500 text-sm">{wisdom.meaning_en}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-primary">📜 {wisdom.source}</span>
                  {wisdom.source_detail && <span className="text-gray-400">{wisdom.source_detail}</span>}
                  {wisdom.display_date && <span className="text-amber-600">📅 {wisdom.display_date}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(wisdom.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    wisdom.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {wisdom.is_active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => openModal(wisdom)}
                  className="p-2 text-gray-400 hover:text-primary"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteWisdom(wisdom.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-xl z-50 overflow-auto max-h-[90vh]"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{editingWisdom ? 'แก้ไขข้อคิด' : 'เพิ่มข้อคิดใหม่'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อาหรับ *</label>
                  <input
                    type="text"
                    value={formData.arabic}
                    onChange={(e) => setFormData({...formData, arabic: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 font-arabic text-xl text-right"
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอ่าน *</label>
                  <input
                    type="text"
                    value={formData.transliteration}
                    onChange={(e) => setFormData({...formData, transliteration: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ความหมาย (ไทย) *</label>
                    <textarea
                      value={formData.meaning_th}
                      onChange={(e) => setFormData({...formData, meaning_th: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ความหมาย (EN) *</label>
                    <textarea
                      value={formData.meaning_en}
                      onChange={(e) => setFormData({...formData, meaning_en: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                      rows={2}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ที่มา *</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Quran">Quran</option>
                      <option value="Hadith">Hadith</option>
                      <option value="Athar">Athar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดที่มา</label>
                    <input
                      type="text"
                      value={formData.source_detail}
                      onChange={(e) => setFormData({...formData, source_detail: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                      placeholder={"เช่น Surah Al-Baqarah 2:286"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่แสดง (เว้นว่างหมุนเวียน)</label>
                    <input
                      type="date"
                      value={formData.display_date}
                      onChange={(e) => setFormData({...formData, display_date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-5 h-5 text-primary rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">เปิดใช้งาน</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    {editingWisdom ? 'บันทึก' : 'เพิ่ม'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
