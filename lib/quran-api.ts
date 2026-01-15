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
  audioUrl?: string;
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

export interface Reciter {
  id: number;
  name: string;
  style?: string;
}

// Available reciters
export const RECITERS: Reciter[] = [
  { id: 7, name: 'Mishari Rashid al-Afasy' },
  { id: 3, name: 'Abdur-Rahman as-Sudais' },
  { id: 4, name: 'Abu Bakr al-Shatri' },
  { id: 1, name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
  { id: 2, name: 'AbdulBaset AbdulSamad', style: 'Murattal' },
  { id: 5, name: 'Hani ar-Rifai' },
  { id: 12, name: 'Mahmoud Khalil Al-Husary', style: 'Muallim' },
];

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

// Get Thai translation (King Fahad Quran Complex - resource_id: 51)
export async function getThaiTranslation(chapterId: number): Promise<string[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/quran/translations/51?chapter_number=${chapterId}`
    );
    if (!response.ok) return [];
    const data: TranslationsResponse = await response.json();
    return data.translations.map(t => t.text.replace(/<[^>]*>/g, ''));
  } catch {
    return [];
  }
}

// Get audio URLs for verses
export async function getAudioUrls(chapterId: number, reciterId: number = 7): Promise<string[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/recitations/${reciterId}/by_chapter/${chapterId}`
    );
    if (!response.ok) return [];
    const data = await response.json();

    // Audio files are stored on CDN
    return data.audio_files.map((file: { url: string }) => file.url);
  } catch {
    return [];
  }
}

// Get verses with translations and audio
export async function getVersesWithTranslation(
  chapterId: number,
  locale: string,
  reciterId: number = 7
): Promise<Verse[]> {
  const [verses, enTranslations, thTranslations, audioUrls] = await Promise.all([
    getVerses(chapterId),
    getEnglishTranslation(chapterId),
    locale === 'th' ? getThaiTranslation(chapterId) : Promise.resolve([]),
    getAudioUrls(chapterId, reciterId),
  ]);

  return verses.map((verse, index) => ({
    ...verse,
    translation: locale === 'th' && thTranslations[index]
      ? thTranslations[index]
      : enTranslations[index] || '',
    audioUrl: audioUrls[index] || '',
  }));
}

// Get chapter audio URL (full surah recitation)
export function getChapterAudioUrl(chapterId: number): string {
  // Pad chapter number to 3 digits
  const paddedChapter = chapterId.toString().padStart(3, '0');
  // CDN URL pattern for full chapter audio
  return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3teleasy/${paddedChapter}.mp3`;
}
