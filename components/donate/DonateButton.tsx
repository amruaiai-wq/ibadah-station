'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DonateButtonProps {
  locale: string;
}

const presetAmounts = [50, 100, 200, 500];

export default function DonateButton({ locale }: DonateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    th: {
      donate: 'สนับสนุน',
      supportDev: 'สนับสนุนผู้พัฒนา',
      title: 'สนับสนุน Ibadah Station',
      subtitle: 'ช่วยเราพัฒนาแพลตฟอร์มเรียนรู้อิสลามต่อไป',
      selectAmount: 'เลือกจำนวนเงิน (บาท)',
      customAmount: 'จำนวนอื่นๆ',
      proceed: 'ดำเนินการชำระเงิน',
      processing: 'กำลังดำเนินการ...',
      cancel: 'ยกเลิก',
      minAmount: 'จำนวนเงินขั้นต่ำ 20 บาท',
      thankYou: 'ขอบคุณที่สนับสนุน',
      paymentMethods: 'รับชำระผ่าน Credit Card และ PromptPay',
    },
    en: {
      donate: 'Donate',
      supportDev: 'Support Developer',
      title: 'Support Ibadah Station',
      subtitle: 'Help us continue developing this Islamic learning platform',
      selectAmount: 'Select amount (THB)',
      customAmount: 'Custom amount',
      proceed: 'Proceed to Payment',
      processing: 'Processing...',
      cancel: 'Cancel',
      minAmount: 'Minimum amount is 20 THB',
      thankYou: 'Thank you for your support',
      paymentMethods: 'We accept Credit Card and PromptPay',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  const handleDonate = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount;

    if (!finalAmount || finalAmount < 20) {
      setError(text.minAmount);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Donation error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Donate Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-dark text-dark font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-md"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="hidden sm:inline">{text.donate}</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{text.title}</h2>
                      <p className="text-white/80 text-sm mt-1">{text.subtitle}</p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{text.selectAmount}</p>

                  {/* Preset Amounts */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setAmount(preset);
                          setCustomAmount('');
                          setError(null);
                        }}
                        className={`py-3 rounded-lg font-medium transition-all ${
                          amount === preset && !customAmount
                            ? 'bg-gold text-dark'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ฿{preset}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      {text.customAmount}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setError(null);
                        }}
                        placeholder="0"
                        min="20"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}

                  {/* Payment Methods Note */}
                  <p className="text-gray-500 text-xs mb-4 text-center">
                    {text.paymentMethods}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {text.cancel}
                    </button>
                    <button
                      onClick={handleDonate}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-gold hover:bg-gold-dark text-dark font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {text.processing}
                        </>
                      ) : (
                        text.proceed
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
