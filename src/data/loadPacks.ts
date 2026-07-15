import type { Card } from '../engine/types';

import diziTr from './packs/ip/dizi_tr.json';
import diziGlobal from './packs/ip/dizi_global.json';
import filmKarakter from './packs/ip/film_karakter.json';
import oyunKarakter from './packs/ip/oyun_karakter.json';
import superKahraman from './packs/ip/super_kahraman.json';
import muzisyen from './packs/ip/muzisyen.json';
import unlu from './packs/who/unlu.json';
import sporcu from './packs/who/sporcu.json';
import tarihKisi from './packs/who/tarih_kisi.json';

const WHO_CATEGORY_IDS = new Set([
  'dizi_tr',
  'dizi_global',
  'film_karakter',
  'oyun_karakter',
  'super_kahraman',
  'muzisyen',
  'unlu',
  'sporcu',
  'tarih_kisi',
]);

function assertWhoCards(cards: Card[], label: string): Card[] {
  for (const c of cards) {
    if (!c.difficulty) throw new Error(`Pack ${label}: ${c.id} missing difficulty`);
    if (!WHO_CATEGORY_IDS.has(c.categoryId)) {
      throw new Error(`Pack ${label}: non-WHO ${c.categoryId}`);
    }
    if (c.visual.kind !== 'none') {
      throw new Error(`Pack ${label}: ${c.id} must visual.none`);
    }
  }
  return cards;
}

export const CATEGORY_META: Record<
  string,
  { id: string; name: string; group: 'who'; emoji: string; free?: boolean }
> = {
  dizi_tr: { id: 'dizi_tr', name: 'Yerli dizi', group: 'who', emoji: '📺', free: true },
  dizi_global: { id: 'dizi_global', name: 'Yabancı dizi', group: 'who', emoji: '🎬' },
  film_karakter: { id: 'film_karakter', name: 'Film', group: 'who', emoji: '🍿', free: true },
  oyun_karakter: { id: 'oyun_karakter', name: 'Oyun', group: 'who', emoji: '🎮' },
  super_kahraman: { id: 'super_kahraman', name: 'Süper kahraman', group: 'who', emoji: '🦸' },
  muzisyen: { id: 'muzisyen', name: 'Müzisyen', group: 'who', emoji: '🎤' },
  unlu: { id: 'unlu', name: 'Ünlüler', group: 'who', emoji: '⭐', free: true },
  sporcu: { id: 'sporcu', name: 'Sporcular', group: 'who', emoji: '🏅' },
  tarih_kisi: { id: 'tarih_kisi', name: 'Tarihî kişiler', group: 'who', emoji: '🏛️' },
  custom: { id: 'custom', name: 'Kendi kartım', group: 'who', emoji: '✍️' },
};

/** Ücretsiz “Genel” — yalnızca kişi/karakter paketleri */
export const GENERAL_PRESET = ['unlu', 'film_karakter', 'dizi_tr'];

export function loadAllCards(): Card[] {
  return [
    ...assertWhoCards(diziTr as Card[], 'dizi_tr'),
    ...assertWhoCards(diziGlobal as Card[], 'dizi_global'),
    ...assertWhoCards(filmKarakter as Card[], 'film_karakter'),
    ...assertWhoCards(oyunKarakter as Card[], 'oyun_karakter'),
    ...assertWhoCards(superKahraman as Card[], 'super_kahraman'),
    ...assertWhoCards(muzisyen as Card[], 'muzisyen'),
    ...assertWhoCards(unlu as Card[], 'unlu'),
    ...assertWhoCards(sporcu as Card[], 'sporcu'),
    ...assertWhoCards(tarihKisi as Card[], 'tarih_kisi'),
  ];
}

export const CLASSIC_PARTY_PRESET = [...GENERAL_PRESET];
export const GENERAL_CULTURE_PRESET = ['tarih_kisi', 'sporcu', 'unlu'];
export const ENTERTAINMENT_PRESET = [
  'dizi_tr',
  'dizi_global',
  'film_karakter',
  'oyun_karakter',
  'muzisyen',
  'super_kahraman',
];

export function whoCategoryCount(): number {
  return Object.values(CATEGORY_META).filter((c) => c.group === 'who' && c.id !== 'custom').length;
}

export function coreCategoryCount(): number {
  return whoCategoryCount();
}

export function ipCategoryCount(): number {
  return whoCategoryCount();
}

export function isCategoryLocked(categoryId: string, unlocked: boolean): boolean {
  if (unlocked) return false;
  return !GENERAL_PRESET.includes(categoryId);
}
