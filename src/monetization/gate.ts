import { initAds, showInterstitialAd } from './ads';
import { warnIfMonetizationMisconfigured } from './config';
import { loadPremiumUnlocked } from '../storage/entitlements';

const COOLDOWN_MS = 90_000;
let lastInterstitialAt = 0;
let premiumCache = false;

export function setPremiumAdGate(isPremium: boolean) {
  premiumCache = isPremium;
}

export async function bootMonetization(isPremium: boolean): Promise<void> {
  premiumCache = isPremium;
  warnIfMonetizationMisconfigured();
  if (!isPremium) {
    await initAds();
  }
}

/**
 * Sayfa arası reklam — premium’da yok.
 * Play / ready / next_player içinde çağırmayın (parti bozulmasın).
 */
export async function maybeShowInterstitial(opts?: {
  force?: boolean;
}): Promise<void> {
  if (premiumCache) return;
  if (await loadPremiumUnlocked()) {
    premiumCache = true;
    return;
  }
  const now = Date.now();
  if (!opts?.force && now - lastInterstitialAt < COOLDOWN_MS) return;
  lastInterstitialAt = now;
  await showInterstitialAd();
}
