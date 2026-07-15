import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DifficultyTempo } from '../engine/types';

const KEYS = {
  onboarding: 'benkimim.onboarding.v1',
  prefs: 'benkimim.prefs.v1',
} as const;

export type AppPrefs = {
  gyroEnabled: boolean;
  tiltInverted: boolean;
  cardTextScale: 'normal' | 'xl';
  passPenalty: 0 | 1;
  hapticsEnabled: boolean;
  keepAwake: boolean;
  defaultDurationSec: 45 | 60 | 90;
  defaultTempo: DifficultyTempo;
};

export const DEFAULT_PREFS: AppPrefs = {
  gyroEnabled: true,
  tiltInverted: false,
  cardTextScale: 'normal',
  passPenalty: 0,
  hapticsEnabled: true,
  keepAwake: true,
  defaultDurationSec: 60,
  defaultTempo: 'classic',
};

export async function loadOnboardingDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.onboarding)) === '1';
  } catch {
    return false;
  }
}

export async function saveOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarding, '1');
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.onboarding);
}

export async function loadPrefs(): Promise<AppPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.prefs);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<AppPrefs> & { soundEnabled?: boolean };
    // Ses efekti kaldırıldı — eski kayıttan temizle
    const { soundEnabled: _drop, ...rest } = parsed;
    return { ...DEFAULT_PREFS, ...rest };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function savePrefs(prefs: AppPrefs): Promise<void> {
  await AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
}
