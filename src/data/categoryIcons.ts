/** Expo Ionicons names for WHO categories — UI tarafında `@expo/vector-icons` ile kullan. */
export type CategoryIonicon =
  | 'tv-outline'
  | 'film-outline'
  | 'videocam-outline'
  | 'game-controller-outline'
  | 'flash-outline'
  | 'musical-notes-outline'
  | 'star-outline'
  | 'football-outline'
  | 'time-outline'
  | 'create-outline'
  | 'sparkles-outline';

export const CATEGORY_ICON: Record<string, CategoryIonicon> = {
  dizi_tr: 'tv-outline',
  dizi_global: 'videocam-outline',
  film_karakter: 'film-outline',
  oyun_karakter: 'game-controller-outline',
  super_kahraman: 'flash-outline',
  muzisyen: 'musical-notes-outline',
  unlu: 'star-outline',
  sporcu: 'football-outline',
  tarih_kisi: 'time-outline',
  custom: 'create-outline',
};

export function categoryIcon(categoryId: string): CategoryIonicon {
  return CATEGORY_ICON[categoryId] ?? 'sparkles-outline';
}
