import Constants from 'expo-constants';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import { PREMIUM_PRODUCT_ID } from './config';
import {
  loadPremiumUnlocked,
  savePremiumUnlocked,
} from '../storage/entitlements';

type IapSdk = typeof import('expo-iap');

let iap: IapSdk | null | undefined;
let connected = false;

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/** Expo Go’da native IAP yok — require etmeden önce bak. */
export function iapNativeAvailable(): boolean {
  if (Platform.OS === 'web' || isExpoGo()) return false;
  const names = ['ExpoIap', 'RNIap', 'RNIapModule'];
  try {
    for (const n of names) {
      if (TurboModuleRegistry.get(n) != null) return true;
    }
  } catch {
    /* ignore */
  }
  return names.some((n) => NativeModules[n] != null);
}

function loadIap(): IapSdk | null {
  if (iap !== undefined) return iap;
  if (!iapNativeAvailable()) {
    iap = null;
    return iap;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iap = require('expo-iap') as IapSdk;
  } catch {
    iap = null;
  }
  return iap;
}

async function ensureConnected(): Promise<IapSdk | null> {
  const sdk = loadIap();
  if (!sdk) return null;
  if (!connected) {
    try {
      await sdk.initConnection();
      connected = true;
    } catch {
      return null;
    }
  }
  return sdk;
}

export type PurchaseResult =
  | { ok: true; source: 'store' | 'restore' | 'stub' }
  | { ok: false; reason: 'cancelled' | 'unavailable' | 'error'; message?: string };

/** Tek seferlik premium — tüm kategoriler + reklam yok. */
export async function purchasePremiumLifetime(): Promise<PurchaseResult> {
  const sdk = await ensureConnected();
  if (!sdk) {
    if (__DEV__) {
      await savePremiumUnlocked();
      return { ok: true, source: 'stub' };
    }
    return {
      ok: false,
      reason: 'unavailable',
      message: 'Mağaza yok — EAS development build gerekir',
    };
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const unsubOk = sdk.purchaseUpdatedListener(async (purchase) => {
        try {
          const productId = String(
            (purchase as { productId?: string }).productId ?? '',
          );
          if (productId && productId !== PREMIUM_PRODUCT_ID) return;
          await sdk.finishTransaction({ purchase, isConsumable: false });
          await savePremiumUnlocked();
          unsubOk.remove();
          unsubErr.remove();
          resolve();
        } catch (e) {
          unsubOk.remove();
          unsubErr.remove();
          reject(e);
        }
      });
      const unsubErr = sdk.purchaseErrorListener((err) => {
        unsubOk.remove();
        unsubErr.remove();
        const code = String((err as { code?: string }).code ?? '');
        if (code.toLowerCase().includes('cancel')) {
          reject(Object.assign(new Error('cancelled'), { code: 'cancelled' }));
        } else {
          reject(err);
        }
      });

      void sdk
        .requestPurchase({
          type: 'in-app',
          request: {
            apple: { sku: PREMIUM_PRODUCT_ID },
            google: { skus: [PREMIUM_PRODUCT_ID] },
          },
        })
        .catch(reject);

      setTimeout(() => {
        unsubOk.remove();
        unsubErr.remove();
        reject(new Error('timeout'));
      }, 120_000);
    });
    return { ok: true, source: 'store' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'cancelled' || (e as { code?: string }).code === 'cancelled') {
      return { ok: false, reason: 'cancelled' };
    }
    return { ok: false, reason: 'error', message: msg };
  }
}

export async function restorePremiumPurchases(): Promise<PurchaseResult> {
  const sdk = await ensureConnected();
  if (!sdk) {
    const local = await loadPremiumUnlocked();
    if (local) return { ok: true, source: 'restore' };
    if (__DEV__) {
      await savePremiumUnlocked();
      return { ok: true, source: 'stub' };
    }
    return {
      ok: false,
      reason: 'unavailable',
      message: 'Mağaza yok — EAS development build gerekir',
    };
  }

  try {
    await sdk.restorePurchases();
    const purchases = await sdk.getAvailablePurchases();
    const hit = purchases.some((p) => {
      const id = String((p as { productId?: string }).productId ?? '');
      return id === PREMIUM_PRODUCT_ID;
    });
    if (hit) {
      await savePremiumUnlocked();
      return { ok: true, source: 'restore' };
    }
    return { ok: false, reason: 'error', message: 'Satın alma bulunamadı' };
  } catch (e) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? e.message : String(e),
    };
  }
}
