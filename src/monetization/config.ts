/**
 * Monetization + store legal URLs.
 * Live site: https://mertsavas97-spec.github.io/benkimim/
 */
import { Platform } from 'react-native';

/** Tek seferlik (non-consumable) premium */
export const PREMIUM_PRODUCT_ID =
  process.env.EXPO_PUBLIC_IAP_PREMIUM_ID ?? 'com.benkimim.app.premium_lifetime';

/** GitHub Pages (ASC Privacy / Support URL) */
export const LEGAL_SITE_BASE =
  process.env.EXPO_PUBLIC_LEGAL_SITE_BASE ??
  'https://mertsavas97-spec.github.io/benkimim';

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? `${LEGAL_SITE_BASE}/privacy/`;

export const SUPPORT_URL =
  process.env.EXPO_PUBLIC_SUPPORT_URL ?? `${LEGAL_SITE_BASE}/support/`;

export const TERMS_URL =
  process.env.EXPO_PUBLIC_TERMS_URL ?? `${LEGAL_SITE_BASE}/terms/`;

const GOOGLE_TEST_PUBLISHER = '3940256099942544';

/** --- Production unit IDs (AdMob) --- */
export const PROD_AD_UNIT_BANNER =
  process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ??
  'ca-app-pub-4628962707131944/3039743218';

export const PROD_AD_UNIT_INTERSTITIAL =
  process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID ??
  'ca-app-pub-4628962707131944/9176253648';

export const PROD_AD_UNIT_REWARDED =
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID ??
  'ca-app-pub-4628962707131944/3311205951';

const TEST_BANNER =
  Platform.OS === 'ios'
    ? `ca-app-pub-${GOOGLE_TEST_PUBLISHER}/2934735716`
    : `ca-app-pub-${GOOGLE_TEST_PUBLISHER}/6300978111`;

const TEST_INTERSTITIAL =
  Platform.OS === 'ios'
    ? `ca-app-pub-${GOOGLE_TEST_PUBLISHER}/4411468910`
    : `ca-app-pub-${GOOGLE_TEST_PUBLISHER}/1033173712`;

const TEST_REWARDED =
  Platform.OS === 'ios'
    ? `ca-app-pub-${GOOGLE_TEST_PUBLISHER}/1712484513`
    : `ca-app-pub-${GOOGLE_TEST_PUBLISHER}/5224354917`;

export const AD_UNIT_BANNER = __DEV__ ? TEST_BANNER : PROD_AD_UNIT_BANNER;
export const AD_UNIT_INTERSTITIAL = __DEV__
  ? TEST_INTERSTITIAL
  : PROD_AD_UNIT_INTERSTITIAL;
export const AD_UNIT_REWARDED = __DEV__ ? TEST_REWARDED : PROD_AD_UNIT_REWARDED;

export const ALLOW_AD_STUB =
  __DEV__ || process.env.EXPO_PUBLIC_ALLOW_AD_STUB === '1';

export function isUsingGoogleTestAdUnits(): boolean {
  const ids = [PROD_AD_UNIT_BANNER, PROD_AD_UNIT_INTERSTITIAL, PROD_AD_UNIT_REWARDED];
  return ids.some((id) => id.includes(GOOGLE_TEST_PUBLISHER));
}

export function canServeLiveAds(): boolean {
  if (__DEV__) return true;
  if (process.env.EXPO_PUBLIC_ALLOW_TEST_ADS === '1') return true;
  return !isUsingGoogleTestAdUnits();
}

export function warnIfMonetizationMisconfigured(): void {
  if (__DEV__) return;
  if (isUsingGoogleTestAdUnits()) {
    console.warn(
      '[benkimim] Production build still uses Google test AdMob unit IDs.',
    );
  }
  if (process.env.EXPO_PUBLIC_ALLOW_AD_STUB === '1') {
    console.warn(
      '[benkimim] EXPO_PUBLIC_ALLOW_AD_STUB=1 in production — disable for store builds.',
    );
  }
}
