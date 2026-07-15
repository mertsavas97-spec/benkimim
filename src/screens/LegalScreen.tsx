import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import {
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_URL,
} from '../monetization/config';
import { colors, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = { onBack: () => void };

function open(url: string) {
  void Linking.openURL(url);
}

export function LegalScreen({ onBack }: Props) {
  return (
    <ScreenAtmosphere>
      <ScrollView contentContainerStyle={styles.content}>
        <BackHeader onBack={onBack} />
        <Text style={styles.title}>Hakkında</Text>
        <Text style={styles.body}>
          Ben Kimim — yüz yüze oynanan alın tahmini. Tek telefon, çevrimdışı, masa merkezli.
        </Text>

        <Text style={styles.section}>Lisans uyarısı</Text>
        <Text style={styles.body}>
          Tahmin oyunu — resmi lisanslı ürün değildir. Karakter ve sanatçı isimleri yalnızca metin
          referansıdır; telifli görseller kullanılmaz.
        </Text>

        <Text style={styles.section}>Yasal sayfalar</Text>
        <LinkRow label="Gizlilik politikası" url={PRIVACY_POLICY_URL} />
        <LinkRow label="Destek" url={SUPPORT_URL} />
        <LinkRow label="Kullanım koşulları" url={TERMS_URL} />

        <Text style={styles.section}>Reklamlar</Text>
        <Text style={styles.body}>
          Ücretsiz sürümde ana sayfa ve ayarlarda altta küçük bir reklam bandı görünebilir; menü
          geçişlerinde kısa bir ara reklam da çıkabilir. Tüm kategorileri açmak için bir ödüllü
          reklam izleyebilirsin. Oyun sırasında reklam yok — masaya odaklan. Premium’da hiç reklam
          yok.
        </Text>

        <Text style={styles.section}>Premium</Text>
        <Text style={styles.body}>
          Tek seferlik satın alma — abonelik değil. Tüm kategoriler açık; banner, geçiş ve ödüllü
          reklamlar kapanır. Ödemeyi Apple / Google alır; Ayarlar’dan geri yükleyebilirsin.
        </Text>

        <Text style={styles.section}>Sürüm</Text>
        <Text style={styles.body}>1.0.0 · Masa Gecesi</Text>
      </ScrollView>
    </ScreenAtmosphere>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      onPress={() => open(url)}
      accessibilityRole="link"
      style={styles.linkRow}
    >
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkUrl} numberOfLines={2}>
        {url}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
    marginBottom: space.md,
  },
  section: {
    marginTop: space.lg,
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    fontSize: 15,
  },
  body: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    color: colors.ink,
    opacity: 0.9,
    lineHeight: 22,
    fontSize: 15,
  },
  linkRow: {
    marginTop: space.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.bgElev,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(240,180,41,0.25)',
  },
  linkLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 15,
  },
  linkUrl: {
    marginTop: 4,
    fontFamily: fonts.body,
    color: colors.accent,
    fontSize: 12,
    lineHeight: 16,
  },
});
