import Constants from 'expo-constants';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import {
  AD_UNIT_BANNER,
  AD_UNIT_INTERSTITIAL,
  AD_UNIT_REWARDED,
  ALLOW_AD_STUB,
  canServeLiveAds,
} from './config';

type AdsSdk = typeof import('react-native-google-mobile-ads');

let sdk: AdsSdk | null | undefined;
let initPromise: Promise<boolean> | null = null;

export function isExpoGoRuntime(): boolean {
  return Constants.appOwnership === 'expo';
}

export function adsNativeAvailable(): boolean {
  if (Platform.OS === 'web' || isExpoGoRuntime()) return false;
  try {
    if (TurboModuleRegistry.get('RNGoogleMobileAdsModule') != null) return true;
  } catch {
    /* ignore */
  }
  return NativeModules.RNGoogleMobileAdsModule != null;
}

export function loadAdsSdk(): AdsSdk | null {
  if (sdk !== undefined) return sdk;
  if (!adsNativeAvailable()) {
    sdk = null;
    return sdk;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sdk = require('react-native-google-mobile-ads') as AdsSdk;
  } catch {
    sdk = null;
  }
  return sdk;
}

export async function initAds(): Promise<boolean> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (isExpoGoRuntime() || !canServeLiveAds()) return false;
    const ads = loadAdsSdk();
    if (!ads) return false;
    try {
      await ads.default().initialize();
      return true;
    } catch {
      return false;
    }
  })();
  return initPromise;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function resolveBannerUnitId(ads: AdsSdk): string {
  return __DEV__ ? ads.TestIds.BANNER : AD_UNIT_BANNER;
}

export function shouldShowBannerAds(isPremium: boolean): boolean {
  if (isPremium) return false;
  if (isExpoGoRuntime()) return false;
  if (!canServeLiveAds() && !__DEV__) return false;
  return adsNativeAvailable();
}

/** Kategori açma — rewarded */
export async function showRewardedUnlockAd(): Promise<boolean> {
  if (isExpoGoRuntime() || !canServeLiveAds()) {
    if (!ALLOW_AD_STUB) return false;
    await sleep(700);
    return true;
  }
  const ads = loadAdsSdk();
  if (!ads) {
    if (!ALLOW_AD_STUB) return false;
    await sleep(700);
    return true;
  }

  await initAds();
  const unitId = __DEV__ ? ads.TestIds.REWARDED : AD_UNIT_REWARDED;

  return new Promise((resolve) => {
    try {
      const rewarded = ads.RewardedAd.createForAdRequest(unitId);
      let earned = false;
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        unsub();
        resolve(ok);
      };
      const unsub = rewarded.addAdEventListener(ads.AdEventType.CLOSED, () => {
        finish(earned);
      });
      rewarded.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
        void rewarded.show();
      });
      rewarded.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      rewarded.addAdEventListener(ads.AdEventType.ERROR, () => {
        if (ALLOW_AD_STUB) {
          void sleep(400).then(() => finish(true));
        } else {
          finish(false);
        }
      });
      rewarded.load();
    } catch {
      if (ALLOW_AD_STUB) {
        void sleep(400).then(() => resolve(true));
      } else {
        resolve(false);
      }
    }
  });
}

/** Sayfa arası interstitial */
export async function showInterstitialAd(): Promise<void> {
  if (isExpoGoRuntime() || !canServeLiveAds()) {
    if (ALLOW_AD_STUB && __DEV__) await sleep(200);
    return;
  }
  const ads = loadAdsSdk();
  if (!ads) {
    if (ALLOW_AD_STUB && __DEV__) await sleep(200);
    return;
  }

  await initAds();
  const unitId = __DEV__ ? ads.TestIds.INTERSTITIAL : AD_UNIT_INTERSTITIAL;

  await new Promise<void>((resolve) => {
    try {
      const interstitial = ads.InterstitialAd.createForAdRequest(unitId);
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        unsubClose();
        unsubErr();
        resolve();
      };
      const unsubClose = interstitial.addAdEventListener(ads.AdEventType.CLOSED, done);
      const unsubErr = interstitial.addAdEventListener(ads.AdEventType.ERROR, done);
      interstitial.addAdEventListener(ads.AdEventType.LOADED, () => {
        void interstitial.show().catch(done);
      });
      interstitial.load();
      setTimeout(done, 8000);
    } catch {
      resolve();
    }
  });
}
