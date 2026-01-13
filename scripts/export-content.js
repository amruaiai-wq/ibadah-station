const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read JSON files
const thJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/th.json'), 'utf8'));
const enJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'));

// Journey keys mapping (JSON key -> display name)
const journeyKeys = [
  { key: 'salah', name: 'Salah (การละหมาด)' },
  { key: 'umrah', name: 'Umrah (อุมเราะฮ์)' },
  { key: 'hajj', name: 'Hajj (ฮัจญ์)' },
  { key: 'zakat', name: 'Zakat (ซะกาต)' },
  { key: 'sawm', name: 'Sawm (การถือศีลอด)' },
  { key: 'waterTypes', name: 'Water Types (ประเภทน้ำ)' },
  { key: 'najisTypes', name: 'Najis Types (ประเภทนะยิส)' },
  { key: 'postPrayerAdhkar', name: 'Post-Prayer Adhkar (วิริดหลังละหมาด)' },
  { key: 'morningEveningAdhkar', name: 'Morning/Evening Adhkar (อัซการเช้า-เย็น)' },
  { key: 'dailyDuas', name: 'Daily Duas (ดุอาประจำวัน)' },
  { key: 'dailySunnah', name: 'Daily Sunnah (สุนนะฮ์ประจำวัน)' },
];

// Build rows for Excel
const rows = [];

// Add header row
rows.push([
  'Journey',
  'Journey Key',
  'Step ID',
  'Title (TH)',
  'Title (EN)',
  'Title Arabic',
  'Description (TH)',
  'Description (EN)',
  'Details (TH)',
  'Details (EN)',
  'Tips (TH)',
  'Tips (EN)',
  'Icon',
  'Dua Arabic',
  'Dua Transliteration',
  'Dua Meaning (TH)',
  'Dua Meaning (EN)',
]);

// Process each journey
journeyKeys.forEach(({ key, name }) => {
  const thData = thJson[key];
  const enData = enJson[key];

  if (!thData || !thData.steps) {
    console.log(`Skipping ${key} - no steps found`);
    return;
  }

  const thSteps = thData.steps;
  const enSteps = enData?.steps || [];

  thSteps.forEach((thStep, index) => {
    const enStep = enSteps[index] || {};

    // Handle details array - join with |
    const detailsTh = Array.isArray(thStep.details) ? thStep.details.join(' | ') : (thStep.details || '');
    const detailsEn = Array.isArray(enStep.details) ? enStep.details.join(' | ') : (enStep.details || '');

    // Handle dua object
    const duaArabic = thStep.dua?.arabic || '';
    const duaTranslit = thStep.dua?.transliteration || '';
    const duaMeaningTh = thStep.dua?.meaning || '';
    const duaMeaningEn = enStep.dua?.meaning || '';

    rows.push([
      name,
      key,
      thStep.id || (index + 1),
      thStep.title || '',
      enStep.title || '',
      thStep.titleArabic || '',
      thStep.description || '',
      enStep.description || '',
      detailsTh,
      detailsEn,
      thStep.tips || '',
      enStep.tips || '',
      thStep.icon || '',
      duaArabic,
      duaTranslit,
      duaMeaningTh,
      duaMeaningEn,
    ]);
  });
});

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);

// Set column widths
ws['!cols'] = [
  { wch: 35 },  // Journey
  { wch: 20 },  // Journey Key
  { wch: 8 },   // Step ID
  { wch: 25 },  // Title TH
  { wch: 25 },  // Title EN
  { wch: 30 },  // Title Arabic
  { wch: 50 },  // Description TH
  { wch: 50 },  // Description EN
  { wch: 80 },  // Details TH
  { wch: 80 },  // Details EN
  { wch: 50 },  // Tips TH
  { wch: 50 },  // Tips EN
  { wch: 5 },   // Icon
  { wch: 80 },  // Dua Arabic
  { wch: 80 },  // Dua Transliteration
  { wch: 80 },  // Dua Meaning TH
  { wch: 80 },  // Dua Meaning EN
];

XLSX.utils.book_append_sheet(wb, ws, 'Journey Content');

// Also create a sheet for journey metadata (title, description, etc.)
const metaRows = [
  ['Journey Key', 'Title (TH)', 'Title (EN)', 'Title Arabic', 'Description (TH)', 'Description (EN)'],
];

journeyKeys.forEach(({ key }) => {
  const thData = thJson[key];
  const enData = enJson[key];

  if (!thData) return;

  metaRows.push([
    key,
    thData.title || '',
    enData?.title || '',
    thData.titleArabic || thData.arabic || '',
    thData.description || thData.intro?.description || '',
    enData?.description || enData?.intro?.description || '',
  ]);
});

const wsMeta = XLSX.utils.aoa_to_sheet(metaRows);
wsMeta['!cols'] = [
  { wch: 25 },
  { wch: 30 },
  { wch: 30 },
  { wch: 40 },
  { wch: 60 },
  { wch: 60 },
];
XLSX.utils.book_append_sheet(wb, wsMeta, 'Journey Metadata');

// Write file
const outputPath = path.join(__dirname, '../ibadah-content.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Excel file exported successfully!`);
console.log(`📁 File: ${outputPath}`);
console.log(`📊 Total steps exported: ${rows.length - 1}`);
