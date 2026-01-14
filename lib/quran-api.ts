// Quran.com API Helper

export interface Chapter {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  translation?: string;
}

export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface VersesResponse {
  verses: {
    id: number;
    verse_key: string;
    text_uthmani: string;
  }[];
}

export interface TranslationsResponse {
  translations: {
    resource_id: number;
    text: string;
  }[];
}

const BASE_URL = 'https://api.quran.com/api/v4';

// Get all chapters (surahs)
export async function getChapters(): Promise<Chapter[]> {
  const response = await fetch(`${BASE_URL}/chapters`);
  if (!response.ok) throw new Error('Failed to fetch chapters');
  const data: ChaptersResponse = await response.json();
  return data.chapters;
}

// Get single chapter info
export async function getChapter(chapterId: number): Promise<Chapter> {
  const response = await fetch(`${BASE_URL}/chapters/${chapterId}`);
  if (!response.ok) throw new Error('Failed to fetch chapter');
  const data = await response.json();
  return data.chapter;
}

// Get verses for a chapter (Arabic text)
export async function getVerses(chapterId: number): Promise<Verse[]> {
  const response = await fetch(
    `${BASE_URL}/quran/verses/uthmani?chapter_number=${chapterId}`
  );
  if (!response.ok) throw new Error('Failed to fetch verses');
  const data: VersesResponse = await response.json();

  return data.verses.map((v, index) => ({
    id: v.id,
    verse_key: v.verse_key,
    verse_number: index + 1,
    text_uthmani: v.text_uthmani,
  }));
}

// Get English translation (Sahih International - resource_id: 20)
export async function getEnglishTranslation(chapterId: number): Promise<string[]> {
  const response = await fetch(
    `${BASE_URL}/quran/translations/20?chapter_number=${chapterId}`
  );
  if (!response.ok) throw new Error('Failed to fetch translation');
  const data: TranslationsResponse = await response.json();
  return data.translations.map(t => t.text.replace(/<[^>]*>/g, '')); // Remove HTML tags
}

// Get Thai translation if available (resource_id: 161 - Thai)
export async function getThaiTranslation(chapterId: number): Promise<string[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/quran/translations/161?chapter_number=${chapterId}`
    );
    if (!response.ok) return [];
    const data: TranslationsResponse = await response.json();
    return data.translations.map(t => t.text.replace(/<[^>]*>/g, ''));
  } catch {
    return [];
  }
}

// Get verses with translations
export async function getVersesWithTranslation(
  chapterId: number,
  locale: string
): Promise<Verse[]> {
  const [verses, enTranslations, thTranslations] = await Promise.all([
    getVerses(chapterId),
    getEnglishTranslation(chapterId),
    locale === 'th' ? getThaiTranslation(chapterId) : Promise.resolve([]),
  ]);

  return verses.map((verse, index) => ({
    ...verse,
    translation: locale === 'th' && thTranslations[index]
      ? thTranslations[index]
      : enTranslations[index] || '',
  }));
}
