import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '../engine/types';

const KEY = 'benkimim.customWords.v2';
const KEY_LEGACY = 'benkimim.customWords.v1';

export type CustomWord = {
  text: string;
  difficulty?: Difficulty;
  hint?: string;
  categoryId?: string;
};

export async function loadCustomWords(): Promise<CustomWord[]> {
  try {
    const raw = (await AsyncStorage.getItem(KEY)) ?? (await AsyncStorage.getItem(KEY_LEGACY));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomWord[];
    return Array.isArray(parsed) ? parsed.filter((w) => w.text?.trim()) : [];
  } catch {
    return [];
  }
}

export async function saveCustomWords(words: CustomWord[]): Promise<void> {
  const cleaned = words
    .map((w) => ({
      text: w.text.trim(),
      difficulty: w.difficulty ?? ('medium' as Difficulty),
      hint: w.hint?.trim() || undefined,
      categoryId: w.categoryId?.trim() || 'custom',
    }))
    .filter((w) => w.text.length > 0);
  await AsyncStorage.setItem(KEY, JSON.stringify(cleaned));
}
