import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../monetization/config';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  busy: boolean;
  displayPrice: string | null;
  priceLoading?: boolean;
  onClose: () => void;
  onPurchase: () => void;
  onRestore: () => void;
  onRetryPrice?: () => void;
};

const PERKS = [
  'Tüm kimlik kategorileri',
  'Banner reklam yok',
  'Sayfa arası geçiş reklamı yok',
  'Kategori açmak için reklam izleme yok',
] as const;

export function PremiumPaywallModal({
  visible,
  busy,
  displayPrice,
  priceLoading = false,
  onClose,
  onPurchase,
  onRestore,
  onRetryPrice,
}: Props) {
  const purchaseLabel = busy
    ? 'Satın alınıyor…'
    : displayPrice
      ? `Satın al — ${displayPrice}`
      : 'Satın al';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <Ionicons name="close" size={24} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.iconWrap}>
            <Ionicons name="diamond" size={36} color={colors.accent} />
          </View>
          <Text style={styles.title}>Ömür boyu Premium</Text>
          <Text style={styles.sub}>
            Bir kez satın al — abonelik yok. Tüm kategoriler ve reklamsız oyun.
          </Text>

          {/* ASC: fiyat satın alma butonundan ÖNCE ve net görünmeli */}
          <View style={styles.priceCard} accessibilityLabel="In-app purchase price">
            <Text style={styles.priceCaption}>Fiyat</Text>
            {priceLoading && !displayPrice ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
            ) : displayPrice ? (
              <Text style={styles.priceAmount}>{displayPrice}</Text>
            ) : (
              <Text style={styles.priceMissing}>Fiyat yükleniyor…</Text>
            )}
            <Text style={styles.priceHint}>Tek seferlik · abonelik yok</Text>
            {!displayPrice && onRetryPrice ? (
              <Pressable onPress={onRetryPrice} style={styles.retry}>
                <Text style={styles.retryText}>Fiyatı yenile</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.perks}>
            {PERKS.map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.correct} />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          <PrimaryButton
            label={purchaseLabel}
            onPress={onPurchase}
            disabled={busy || !displayPrice}
            style={styles.cta}
          />

          <Pressable onPress={onRestore} disabled={busy} style={styles.restore}>
            {busy ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Text style={styles.restoreText}>Satın almayı geri yükle</Text>
            )}
          </Pressable>

          <Text style={styles.legal}>
            Satın alma App Store hesabına yansır.{' '}
            <Text style={styles.link} onPress={() => void Linking.openURL(TERMS_URL)}>
              Kullanım koşulları
            </Text>
            {' · '}
            <Text style={styles.link} onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
              Gizlilik
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  close: { padding: space.xs },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(240,180,41,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    marginTop: space.sm,
    maxWidth: 320,
  },
  priceCard: {
    alignSelf: 'stretch',
    marginTop: space.lg,
    alignItems: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(240,180,41,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(240,180,41,0.55)',
    gap: 4,
  },
  priceCaption: {
    fontFamily: fonts.card,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  priceAmount: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.accent,
    letterSpacing: -0.5,
  },
  priceMissing: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    color: colors.ink,
    marginVertical: 8,
  },
  priceHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  retry: { marginTop: space.sm, padding: space.sm },
  retryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  perks: {
    alignSelf: 'stretch',
    marginTop: space.lg,
    gap: space.sm,
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.2)',
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  perkText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  cta: { alignSelf: 'stretch', marginTop: space.lg },
  restore: {
    alignItems: 'center',
    paddingVertical: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: { fontFamily: fonts.bodySemi, color: colors.accent, fontSize: 14 },
  legal: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  link: { color: colors.accent, textDecorationLine: 'underline' },
});
