const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const inputPath = path.join(__dirname, '../ibadah-content.xlsx');

if (!fs.existsSync(inputPath)) {
  console.error('❌ Excel file not found:', inputPath);
  process.exit(1);
}

const wb = XLSX.readFile(inputPath);

// Read existing JSON files to preserve structure
const thJsonPath = path.join(__dirname, '../messages/th.json');
const enJsonPath = path.join(__dirname, '../messages/en.json');

const thJson = JSON.parse(fs.readFileSync(thJsonPath, 'utf8'));
const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

// Process Journey Content sheet
const wsContent = wb.Sheets['Journey Content'];
const contentRows = XLSX.utils.sheet_to_json(wsContent, { header: 1 });

// Skip header row
const dataRows = contentRows.slice(1);

// Group rows by journey key
const journeyData = {};

dataRows.forEach(row => {
  if (!row[1]) return; // Skip empty rows

  const [
    journeyName,
    journeyKey,
    stepId,
    titleTh,
    titleEn,
    titleArabic,
    descriptionTh,
    descriptionEn,
    detailsTh,
    detailsEn,
    tipsTh,
    tipsEn,
    icon,
    duaArabic,
    duaTranslit,
    duaMeaningTh,
    duaMeaningEn,
  ] = row;

  if (!journeyData[journeyKey]) {
    journeyData[journeyKey] = {
      th: [],
      en: [],
    };
  }

  // Parse details back to array
  const parsedDetailsTh = detailsTh ? detailsTh.split(' | ').map(s => s.trim()).filter(Boolean) : [];
  const parsedDetailsEn = detailsEn ? detailsEn.split(' | ').map(s => s.trim()).filter(Boolean) : [];

  // Build Thai step
  const thStep = {
    id: parseInt(stepId) || journeyData[journeyKey].th.length + 1,
    title: titleTh || '',
    titleArabic: titleArabic || '',
    description: descriptionTh || '',
    details: parsedDetailsTh,
    icon: icon || '',
  };

  if (tipsTh) thStep.tips = tipsTh;

  if (duaArabic) {
    thStep.dua = {
      arabic: duaArabic,
      transliteration: duaTranslit || '',
      meaning: duaMeaningTh || '',
    };
  }

  // Build English step
  const enStep = {
    id: parseInt(stepId) || journeyData[journeyKey].en.length + 1,
    title: titleEn || '',
    titleArabic: titleArabic || '',
    description: descriptionEn || '',
    details: parsedDetailsEn,
    icon: icon || '',
  };

  if (tipsEn) enStep.tips = tipsEn;

  if (duaArabic) {
    enStep.dua = {
      arabic: duaArabic,
      transliteration: duaTranslit || '',
      meaning: duaMeaningEn || '',
    };
  }

  journeyData[journeyKey].th.push(thStep);
  journeyData[journeyKey].en.push(enStep);
});

// Process Journey Metadata sheet
const wsMeta = wb.Sheets['Journey Metadata'];
if (wsMeta) {
  const metaRows = XLSX.utils.sheet_to_json(wsMeta, { header: 1 });
  const metaData = metaRows.slice(1); // Skip header

  metaData.forEach(row => {
    const [
      journeyKey,
      titleTh,
      titleEn,
      titleArabic,
      descriptionTh,
      descriptionEn,
    ] = row;

    if (!journeyKey || !thJson[journeyKey]) return;

    // Update Thai metadata
    if (titleTh) thJson[journeyKey].title = titleTh;
    if (titleArabic) {
      thJson[journeyKey].titleArabic = titleArabic;
      thJson[journeyKey].arabic = titleArabic;
    }
    if (descriptionTh) {
      thJson[journeyKey].description = descriptionTh;
      if (thJson[journeyKey].intro) {
        thJson[journeyKey].intro.description = descriptionTh;
      }
    }

    // Update English metadata
    if (enJson[journeyKey]) {
      if (titleEn) enJson[journeyKey].title = titleEn;
      if (titleArabic) {
        enJson[journeyKey].titleArabic = titleArabic;
        enJson[journeyKey].arabic = titleArabic;
      }
      if (descriptionEn) {
        enJson[journeyKey].description = descriptionEn;
        if (enJson[journeyKey].intro) {
          enJson[journeyKey].intro.description = descriptionEn;
        }
      }
    }
  });
}

// Update steps in JSON files
Object.keys(journeyData).forEach(journeyKey => {
  if (thJson[journeyKey]) {
    thJson[journeyKey].steps = journeyData[journeyKey].th;
  }
  if (enJson[journeyKey]) {
    enJson[journeyKey].steps = journeyData[journeyKey].en;
  }
});

// Write updated JSON files
fs.writeFileSync(thJsonPath, JSON.stringify(thJson, null, 2), 'utf8');
fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2), 'utf8');

console.log('✅ Content imported successfully!');
console.log(`📁 Updated: ${thJsonPath}`);
console.log(`📁 Updated: ${enJsonPath}`);
console.log(`📊 Journeys processed: ${Object.keys(journeyData).length}`);
