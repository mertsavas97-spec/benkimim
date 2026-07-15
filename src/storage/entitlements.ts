import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  packsUnlocked: 'benkimim.packsUnlocked.v1',
  premium: 'benkimim.premiumLifetime.v1',
} as const;

export async function loadPacksUnlocked(): Promise<boolean> {
  try {
    if ((await AsyncStorage.getItem(KEYS.premium)) === '1') return true;
    return (await AsyncStorage.getItem(KEYS.packsUnlocked)) === '1';
  } catch {
    return false;
  }
}

export async function savePacksUnlocked(): Promise<void> {
  await AsyncStorage.setItem(KEYS.packsUnlocked, '1');
}

export async function loadPremiumUnlocked(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.premium)) === '1';
  } catch {
    return false;
  }
}

/** Premium → kategoriler de açık + reklamsız */
export async function savePremiumUnlocked(): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.premium, '1'],
    [KEYS.packsUnlocked, '1'],
  ]);
}
