import type { Card } from '../engine/types';

/** Kategori etiketi (her zaman görünür) */
export const CATEGORY_HINT: Record<string, string> = {
  dizi_tr: 'Yerli dizi karakteri',
  dizi_global: 'Yabancı dizi karakteri',
  film_karakter: 'Film karakteri',
  oyun_karakter: 'Oyun karakteri',
  super_kahraman: 'Süper kahraman',
  muzisyen: 'Müzisyen',
  unlu: 'Ünlü kişi',
  sporcu: 'Sporcu',
  tarih_kisi: 'Tarihî kişi',
  custom: 'Kendi kartın',
};

/** Yapım adı sayılmayan yumuşak doldurucular — tek başına kategori yeterli */
const GENERIC_WORK = new Set([
  'yerli dizi',
  'yabancı dizi',
  'sinema',
  'video oyunu',
  'spor',
  'müzik',
  'tarih',
  'sinema / tv / sahne',
  'süper kahraman evreni',
  'uluslararası müzik',
  'türk müzik',
  'türk pop',
  'futbol',
  'basketbol',
  'tenis',
  'atletizm',
  'boks',
]);

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase('tr-TR');
}

/**
 * Format: "Yerli dizi karakteri · Çukur"
 * Yapım bilinmiyorsa yalnızca kategori.
 */
export function resolveCardHint(card: Pick<Card, 'text' | 'categoryId' | 'hint'>): string {
  const cat = CATEGORY_HINT[card.categoryId] ?? 'Kimlik kartı';
  const work = card.hint?.trim();
  if (!work) return cat;
  if (GENERIC_WORK.has(normalize(work))) {
    // Spor branşı gibi kategori altına anlam katıyorsa göster
    if (['futbol', 'basketbol', 'tenis', 'atletizm', 'boks', 'dc', 'marvel', 'türk pop', 'türk müzik'].includes(normalize(work))) {
      return `${cat} · ${work}`;
    }
    return cat;
  }
  if (normalize(work) === normalize(cat)) return cat;
  return `${cat} · ${work}`;
}
