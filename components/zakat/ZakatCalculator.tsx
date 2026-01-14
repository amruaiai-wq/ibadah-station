'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZakatCalculatorProps {
  locale: string;
}

interface AssetCategory {
  id: string;
  icon: string;
  label: { th: string; en: string };
  description: { th: string; en: string };
  fields: {
    id: string;
    label: { th: string; en: string };
    placeholder: { th: string; en: string };
  }[];
}

const assetCategories: AssetCategory[] = [
  {
    id: 'cash',
    icon: '💵',
    label: { th: 'เงินสด & เงินฝาก', en: 'Cash & Savings' },
    description: { th: 'เงินสด เงินในธนาคาร เงินออม', en: 'Cash, bank savings, deposits' },
    fields: [
      { id: 'cash_hand', label: { th: 'เงินสดในมือ', en: 'Cash in hand' }, placeholder: { th: '0', en: '0' } },
      { id: 'cash_bank', label: { th: 'เงินในธนาคาร', en: 'Bank savings' }, placeholder: { th: '0', en: '0' } },
    ],
  },
  {
    id: 'gold',
    icon: '🪙',
    label: { th: 'ทองคำ & เงิน', en: 'Gold & Silver' },
    description: { th: 'ทองคำ เครื่องประดับทอง เงิน', en: 'Gold, gold jewelry, silver' },
    fields: [
      { id: 'gold_value', label: { th: 'มูลค่าทองคำ (บาท)', en: 'Gold value (THB)' }, placeholder: { th: '0', en: '0' } },
      { id: 'silver_value', label: { th: 'มูลค่าเงิน (บาท)', en: 'Silver value (THB)' }, placeholder: { th: '0', en: '0' } },
    ],
  },
  {
    id: 'investments',
    icon: '📈',
    label: { th: 'การลงทุน', en: 'Investments' },
    description: { th: 'หุ้น กองทุน สินทรัพย์ดิจิทัล', en: 'Stocks, mutual funds, crypto' },
    fields: [
      { id: 'stocks', label: { th: 'หุ้น/กองทุน', en: 'Stocks/Funds' }, placeholder: { th: '0', en: '0' } },
      { id: 'crypto', label: { th: 'สินทรัพย์ดิจิทัล', en: 'Crypto assets' }, placeholder: { th: '0', en: '0' } },
    ],
  },
  {
    id: 'business',
    icon: '🏪',
    label: { th: 'ธุรกิจ & สินค้า', en: 'Business & Inventory' },
    description: { th: 'สินค้าคงเหลือ สินทรัพย์ธุรกิจ', en: 'Inventory, business assets' },
    fields: [
      { id: 'inventory', label: { th: 'สินค้าคงเหลือ', en: 'Inventory value' }, placeholder: { th: '0', en: '0' } },
      { id: 'receivables', label: { th: 'ลูกหนี้การค้า', en: 'Receivables' }, placeholder: { th: '0', en: '0' } },
    ],
  },
];

// Nisab threshold in Thai Baht (approximately 85g gold)
const GOLD_PRICE_PER_GRAM = 2800; // Update this with current gold price
const NISAB_GOLD_GRAMS = 85;
const NISAB_THB = GOLD_PRICE_PER_GRAM * NISAB_GOLD_GRAMS; // ~238,000 THB
const ZAKAT_RATE = 0.025; // 2.5%

export default function ZakatCalculator({ locale }: ZakatCalculatorProps) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>('cash');
  const [showResult, setShowResult] = useState(false);

  const texts = {
    th: {
      title: 'คำนวณซะกาต',
      subtitle: 'คำนวณซะกาตที่ต้องจ่ายจากทรัพย์สินของคุณ',
      totalAssets: 'ทรัพย์สินรวม',
      nisabThreshold: 'นิศอบ (เกณฑ์ขั้นต่ำ)',
      zakatDue: 'ซะกาตที่ต้องจ่าย',
      calculate: 'คำนวณซะกาต',
      reset: 'เริ่มใหม่',
      eligible: 'ทรัพย์สินของคุณถึงนิศอบ ต้องจ่ายซะกาต',
      notEligible: 'ทรัพย์สินยังไม่ถึงนิศอบ ไม่ต้องจ่ายซะกาต',
      currency: 'บาท',
      note: 'หมายเหตุ: นิศอบคำนวณจากราคาทองคำ 85 กรัม (ประมาณ',
      disclaimer: 'การคำนวณนี้เป็นเพียงแนวทางเบื้องต้น กรุณาปรึกษานักวิชาการศาสนาสำหรับกรณีเฉพาะ',
      rate: 'อัตราซะกาต: 2.5%',
    },
    en: {
      title: 'Zakat Calculator',
      subtitle: 'Calculate the Zakat due on your assets',
      totalAssets: 'Total Assets',
      nisabThreshold: 'Nisab Threshold',
      zakatDue: 'Zakat Due',
      calculate: 'Calculate Zakat',
      reset: 'Reset',
      eligible: 'Your assets have reached Nisab. Zakat is due.',
      notEligible: 'Your assets have not reached Nisab. No Zakat is due.',
      currency: 'THB',
      note: 'Note: Nisab is calculated based on 85 grams of gold (approximately',
      disclaimer: 'This calculation is for guidance only. Please consult a scholar for specific cases.',
      rate: 'Zakat Rate: 2.5%',
    },
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  const handleInputChange = (fieldId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setValues(prev => ({ ...prev, [fieldId]: numValue }));
  };

  const totalAssets = useMemo(() => {
    return Object.values(values).reduce((sum, val) => sum + val, 0);
  }, [values]);

  const zakatDue = useMemo(() => {
    if (totalAssets >= NISAB_THB) {
      return totalAssets * ZAKAT_RATE;
    }
    return 0;
  }, [totalAssets]);

  const isEligible = totalAssets >= NISAB_THB;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US').format(Math.round(amount));
  };

  const handleReset = () => {
    setValues({});
    setShowResult(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💎</span>
          <h2 className="text-2xl font-bold">{t.title}</h2>
        </div>
        <p className="text-white/80">{t.subtitle}</p>
      </div>

      <div className="p-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {assetCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeCategory === category.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">
                {category.label[locale as keyof typeof category.label] || category.label.th}
              </span>
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <AnimatePresence mode="wait">
          {assetCategories.map((category) =>
            category.id === activeCategory ? (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <p className="text-gray-500 text-sm mb-4">
                  {category.description[locale as keyof typeof category.description] || category.description.th}
                </p>
                {category.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label[locale as keyof typeof field.label] || field.label.th}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={values[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder[locale as keyof typeof field.placeholder] || '0'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {t.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">{t.totalAssets}</span>
            <span className="text-xl font-bold text-gray-800">
              {formatCurrency(totalAssets)} {t.currency}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">{t.nisabThreshold}</span>
            <span className="text-gray-800">
              {formatCurrency(NISAB_THB)} {t.currency}
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-4">
            {t.note} {formatCurrency(NISAB_THB)} {t.currency})
          </div>

          {/* Progress to Nisab */}
          <div className="mb-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isEligible ? 'bg-violet-600' : 'bg-gray-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalAssets / NISAB_THB) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className={`text-sm mt-2 ${isEligible ? 'text-violet-600' : 'text-gray-500'}`}>
              {isEligible ? t.eligible : t.notEligible}
            </p>
          </div>
        </div>

        {/* Zakat Result */}
        <AnimatePresence>
          {(showResult || totalAssets > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-4 p-6 rounded-2xl ${
                isEligible
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <p className="text-sm opacity-80 mb-1">{t.zakatDue}</p>
              <p className="text-4xl font-bold">
                {formatCurrency(zakatDue)} {t.currency}
              </p>
              <p className="text-sm opacity-70 mt-2">{t.rate}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowResult(true)}
            className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
          >
            {t.calculate}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            {t.reset}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}
