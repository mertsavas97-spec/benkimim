import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  initAds,
  loadAdsSdk,
  resolveBannerUnitId,
  shouldShowBannerAds,
} from '../monetization/ads';

type Props = {
  /** Premium ise false */
  enabled: boolean;
};

/**
 * Anchored adaptive banner — Play sırasında kullanma.
 * Expo Go / native yok / premium → null.
 */
export function AdBanner({ enabled }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // enabled = !isPremium from screens; pass isPremium=false when enabled
  const show = enabled && shouldShowBannerAds(false);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    void (async () => {
      const ok = await initAds();
      if (!cancelled) setReady(ok && loadAdsSdk() != null);
    })();
    return () => {
      cancelled = true;
    };
  }, [show]);

  // !show short-circuits even if ready stayed true from a prior mount
  if (!show || failed || !ready) {
    return null;
  }

  const ads = loadAdsSdk();
  if (!ads) return null;

  const { BannerAd, BannerAdSize } = ads;
  const unitId = resolveBannerUnitId(ads);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: Platform.OS === 'ios' }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: '100%',
    minHeight: 50,
  },
});
