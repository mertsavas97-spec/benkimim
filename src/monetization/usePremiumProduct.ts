import { useCallback, useEffect, useState } from 'react';
import {
  getPremiumProductInfo,
  type PremiumProductInfo,
} from './premium';

/**
 * StoreKit fiyatını yükler; başarısız olursa aralıklı yeniden dener.
 * Başarısız null cache’lenmez (ASC review için kritik).
 */
export function usePremiumProduct(enabled = true) {
  const [info, setInfo] = useState<PremiumProductInfo | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const next = await getPremiumProductInfo(true);
    setInfo(next);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      const next = await getPremiumProductInfo(true);
      if (cancelled) return;
      setInfo(next);
      setLoading(false);
    };

    void load();

    // Fiyat gelmediyse review cihazında tekrar dene
    const timer = setInterval(() => {
      void getPremiumProductInfo(true).then((next) => {
        if (cancelled || !next) return;
        setInfo(next);
        setLoading(false);
      });
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled]);

  return {
    info: enabled ? info : null,
    loading: enabled ? loading && !info : false,
    refresh,
  };
}
