'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateWisdomPostcardHTML, 
  generateStepPostcardHTML,
  exportToPDF,
  exportToImage,
  loadLogo,
  WisdomData,
  StepData
} from '@/lib/pdfExport';

interface PostcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'wisdom' | 'step';
  data: WisdomData | StepData;
  locale: string;
  journeyType?: string;
}

export default function PostcardModal({ 
  isOpen, 
  onClose, 
  type, 
  data, 
  locale,
  journeyType = 'salah'
}: PostcardModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [postcardHTML, setPostcardHTML] = useState('');
  const [logoSrc, setLogoSrc] = useState('');

  useEffect(() => {
    // Load logo when modal opens
    if (isOpen) {
      loadLogo().then(setLogoSrc);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && data && logoSrc !== undefined) {
      if (type === 'wisdom') {
        setPostcardHTML(generateWisdomPostcardHTML(data as WisdomData, locale, logoSrc));
      } else {
        setPostcardHTML(generateStepPostcardHTML(data as StepData, locale, journeyType, logoSrc));
      }
    }
  }, [isOpen, data, type, locale, journeyType, logoSrc]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const elementId = type === 'wisdom' ? 'postcard-wisdom' : 'postcard-step';
    const filename = type === 'wisdom' ? 'ibadahstation-wisdom' : `ibadahstation-step-${(data as StepData).stepNumber}`;
    await exportToPDF(elementId, filename);
    setIsExporting(false);
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    const elementId = type === 'wisdom' ? 'postcard-wisdom' : 'postcard-step';
    const filename = type === 'wisdom' ? 'ibadahstation-wisdom' : `ibadahstation-step-${(data as StepData).stepNumber}`;
    await exportToImage(elementId, filename);
    setIsExporting(false);
  };

  const texts = {
    th: {
      title: type === 'wisdom' ? 'สร้าง Postcard ข้อคิด' : 'สร้าง Postcard ขั้นตอน',
      preview: 'ตัวอย่าง',
      exportPDF: 'ดาวน์โหลด PDF',
      exportImage: 'ดาวน์โหลดรูปภาพ',
      exporting: 'กำลังสร้าง...',
      close: 'ปิด',
      tip: '💡 สามารถแชร์ไปยัง Social Media หรือพิมพ์เป็นบัตรได้',
    },
    en: {
      title: type === 'wisdom' ? 'Create Wisdom Postcard' : 'Create Step Postcard',
      preview: 'Preview',
      exportPDF: 'Download PDF',
      exportImage: 'Download Image',
      exporting: 'Creating...',
      close: 'Close',
      tip: '💡 Share on Social Media or print as a card',
    }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                       md:w-full md:max-w-4xl bg-cream rounded-2xl shadow-2xl z-50
                       overflow-hidden flex flex-col max-h-[90vh] border border-gold/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/20 bg-gradient-to-r from-primary to-primary-dark">
              <h2 className="text-lg font-bold text-white">{t.title}</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-cream to-gold/5">
              <p className="text-sm text-primary/60 mb-3 text-center font-medium">{t.preview}</p>
              <div className="flex justify-center">
                <div
                  className="shadow-2xl rounded-lg overflow-hidden ring-1 ring-gold/20"
                  style={{ transform: 'scale(0.65)', transformOrigin: 'top center' }}
                  dangerouslySetInnerHTML={{ __html: postcardHTML }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gold/20 bg-cream">
              <p className="text-xs text-dark/50 text-center mb-3">{t.tip}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10
                           text-primary rounded-xl hover:bg-primary/20 transition-colors font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20"
                >
                  {isExporting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>🖼️</span>
                  )}
                  <span>{isExporting ? t.exporting : t.exportImage}</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gold
                           text-dark rounded-xl hover:bg-gold-dark transition-colors font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isExporting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>📄</span>
                  )}
                  <span>{isExporting ? t.exporting : t.exportPDF}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hidden postcard for export (rendered off-screen) */}
          <div 
            style={{ position: 'fixed', left: '-9999px', top: 0 }}
            dangerouslySetInnerHTML={{ __html: postcardHTML }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
