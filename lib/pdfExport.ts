'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface WisdomData {
  arabic: string;
  transliteration: string;
  meaning: string;
  source: string;
  sourceDetail?: string;
}

export interface StepData {
  title: string;
  titleArabic: string;
  description: string;
  icon: string;
  stepNumber: number;
  totalSteps: number;
  dua?: {
    arabic: string;
    transliteration: string;
    meaning: string;
  };
}

// Base64 logo will be loaded dynamically
let logoBase64: string | null = null;

export const loadLogo = async (): Promise<string> => {
  if (logoBase64) return logoBase64;
  
  try {
    const response = await fetch('/logo.jpg');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64 = reader.result as string;
        resolve(logoBase64);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
};

// Generate Wisdom Postcard HTML
export const generateWisdomPostcardHTML = (wisdom: WisdomData, locale: string, logoSrc: string): string => {
  const texts = {
    th: { title: 'ข้อคิดประจำวัน', source: 'ที่มา' },
    en: { title: 'Daily Wisdom', source: 'Source' }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  return `
    <div id="postcard-wisdom" style="
      width: 800px;
      height: 500px;
      background: linear-gradient(135deg, #006B3F 0%, #004D2C 50%, #003320 100%);
      padding: 40px;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    ">
      <!-- Islamic Pattern Overlay -->
      <div style="
        position: absolute;
        inset: 0;
        opacity: 0.08;
        background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z\" fill=\"%23ffffff\"/%3E%3C/svg%3E');
      "></div>
      
      <!-- Decorative corners -->
      <div style="position: absolute; top: 20px; left: 20px; font-size: 32px; opacity: 0.3;">✨</div>
      <div style="position: absolute; top: 20px; right: 20px; font-size: 32px; opacity: 0.3;">🌙</div>
      
      <!-- Content -->
      <div style="position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <!-- Title -->
        <div style="text-align: center; margin-bottom: 16px;">
          <span style="
            background: rgba(197, 165, 114, 0.2);
            color: #C5A572;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          ">${t.title}</span>
        </div>
        
        <!-- Arabic Text -->
        <div style="
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        ">
          <p style="
            font-size: 36px;
            color: white;
            text-align: center;
            direction: rtl;
            line-height: 1.8;
            margin: 0;
            font-family: 'Traditional Arabic', 'Amiri', serif;
          ">${wisdom.arabic}</p>
        </div>
        
        <!-- Transliteration -->
        <p style="
          color: #C5A572;
          text-align: center;
          font-style: italic;
          font-size: 18px;
          margin: 0 0 10px 0;
        ">"${wisdom.transliteration}"</p>
        
        <!-- Meaning -->
        <p style="
          color: white;
          text-align: center;
          font-size: 18px;
          font-weight: 500;
          margin: 0 0 16px 0;
          line-height: 1.5;
        ">${wisdom.meaning}</p>
        
        <!-- Source -->
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="color: rgba(255,255,255,0.6); font-size: 14px;">
            ${t.source}: ${wisdom.source}${wisdom.sourceDetail ? ` (${wisdom.sourceDetail})` : ''}
          </span>
        </div>
        
        <!-- Logo & Website Footer -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        ">
          ${logoSrc ? `<img src="${logoSrc}" style="width: 36px; height: 36px; border-radius: 50%; background: white; padding: 2px;" />` : ''}
          <div>
            <span style="color: white; font-weight: 600; font-size: 14px;">ibadah</span>
            <span style="color: #C5A572; font-weight: 600; font-size: 14px;">station</span>
            <span style="color: rgba(255,255,255,0.5); font-size: 12px;">.com</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate Step Postcard HTML
export const generateStepPostcardHTML = (step: StepData, locale: string, journeyType: string, logoSrc: string): string => {
  const journeyColors: Record<string, string> = {
    umrah: 'linear-gradient(135deg, #0D9488 0%, #0F766E 50%, #115E59 100%)',
    salah: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)',
    hajj: 'linear-gradient(135deg, #78716C 0%, #57534E 50%, #44403C 100%)',
  };

  const texts = {
    th: { step: 'ขั้นตอนที่', of: 'จาก' },
    en: { step: 'Step', of: 'of' }
  };
  const t = texts[locale as keyof typeof texts] || texts.th;

  return `
    <div id="postcard-step" style="
      width: 800px;
      height: 600px;
      background: ${journeyColors[journeyType] || journeyColors.salah};
      padding: 40px;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    ">
      <!-- Pattern Overlay -->
      <div style="
        position: absolute;
        inset: 0;
        opacity: 0.06;
        background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z\" fill=\"%23ffffff\"/%3E%3C/svg%3E');
      "></div>
      
      <!-- Content -->
      <div style="position: relative; z-index: 10; height: 100%;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="
              font-size: 48px;
              background: rgba(255,255,255,0.2);
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">${step.icon}</span>
            <div>
              <span style="
                background: #C5A572;
                color: #1A1A2E;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">${t.step} ${step.stepNumber} ${t.of} ${step.totalSteps}</span>
            </div>
          </div>
        </div>
        
        <!-- Title -->
        <h1 style="
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
        ">${step.title}</h1>
        <p style="
          color: #C5A572;
          font-size: 24px;
          font-family: 'Traditional Arabic', 'Amiri', serif;
          margin: 0 0 20px 0;
          direction: rtl;
          text-align: left;
        ">${step.titleArabic}</p>
        
        <!-- Description -->
        <p style="
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 24px 0;
        ">${step.description}</p>
        
        ${step.dua ? `
        <!-- Dua Section -->
        <div style="
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          border-left: 4px solid #C5A572;
        ">
          <p style="
            font-size: 22px;
            color: white;
            text-align: right;
            direction: rtl;
            line-height: 1.8;
            margin: 0 0 10px 0;
            font-family: 'Traditional Arabic', 'Amiri', serif;
          ">${step.dua.arabic}</p>
          <p style="
            color: #C5A572;
            font-style: italic;
            font-size: 13px;
            margin: 0 0 6px 0;
          ">${step.dua.transliteration}</p>
          <p style="
            color: rgba(255,255,255,0.8);
            font-size: 13px;
            margin: 0;
          ">${step.dua.meaning}</p>
        </div>
        ` : ''}
        
        <!-- Logo & Website Footer -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        ">
          ${logoSrc ? `<img src="${logoSrc}" style="width: 36px; height: 36px; border-radius: 50%; background: white; padding: 2px;" />` : ''}
          <div>
            <span style="color: white; font-weight: 600; font-size: 14px;">ibadah</span>
            <span style="color: #C5A572; font-weight: 600; font-size: 14px;">station</span>
            <span style="color: rgba(255,255,255,0.5); font-size: 12px;">.com</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Export to PDF
export const exportToPDF = async (
  elementId: string, 
  filename: string,
  orientation: 'landscape' | 'portrait' = 'landscape'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
};

// Export to Image
export const exportToImage = async (
  elementId: string, 
  filename: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting image:', error);
  }
};
