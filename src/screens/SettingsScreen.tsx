import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AdBanner } from '../components/AdBanner';
import { BackHeader } from '../components/BackHeader';
import { CategoryChip } from '../components/CategoryChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { SectionLabel } from '../components/SectionLabel';
import {
  purchasePremiumLifetime,
  restorePremiumPurchases,
} from '../monetization/premium';
import type { AppPrefs } from '../storage/appPrefs';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  prefs: AppPrefs;
  packsUnlocked: boolean;
  isPremium: boolean;
  onChange: (p: AppPrefs) => void;
  onPremiumChange: (on: boolean) => void;
  onBack: () => void;
  onReplayOnboarding: () => void;
  onAbout: () => void;
};

export function SettingsScreen({
  prefs,
  packsUnlocked,
  isPremium,
  onChange,
  onPremiumChange,
  onBack,
  onReplayOnboarding,
  onAbout,
}: Props) {
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function buy() {
    if (busy || isPremium) return;
    setBusy('buy');
    setMsg(null);
    const res = await purchasePremiumLifetime();
    setBusy(null);
    if (res.ok) {
      onPremiumChange(true);
      setMsg(
        res.source === 'stub'
          ? 'Geliştirme: premium açıldı (simülasyon).'
          : 'Premium açıldı. Tüm kategoriler + tüm reklamlar kapalı.',
      );
    } else if (res.reason === 'cancelled') {
      setMsg('Satın alma iptal edildi.');
    } else {
      setMsg(res.message ?? 'Satın alma tamamlanamadı.');
    }
  }

  async function restore() {
    if (busy) return;
    setBusy('restore');
    setMsg(null);
    const res = await restorePremiumPurchases();
    setBusy(null);
    if (res.ok) {
      onPremiumChange(true);
      setMsg('Satın alma geri yüklendi.');
    } else {
      setMsg(res.message ?? 'Geri yüklenecek satın alma yok.');
    }
  }

  return (
    <ScreenAtmosphere>
      <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackHeader title="Ayarlar" onBack={onBack} />
        <Text style={styles.title}>Masa ayarları</Text>
        <Text style={styles.sub}>
          Kontroller, skor ve varsayılanlar. Değişiklikler sonraki turda geçerli.
        </Text>

        <SectionLabel title="Premium" subtitle="Tek seferlik — abonelik yok" />
        <View style={[styles.infoBox, isPremium && styles.premiumOn]}>
          <View style={styles.premiumHead}>
            <Ionicons
              name={isPremium ? 'diamond' : 'diamond-outline'}
              size={22}
              color={colors.accent}
            />
            <Text style={styles.infoTitle}>
              {isPremium ? 'Premium aktif' : 'Ömür boyu Premium'}
            </Text>
          </View>
          {isPremium ? (
            <Text style={styles.infoBody}>
              Tüm kategoriler açık. Banner, geçiş ve ödüllü reklamlar kapalı.
            </Text>
          ) : (
            <View style={styles.perkList}>
              <Text style={styles.infoBody}>Bir kez satın al — abonelik yok:</Text>
              <Text style={styles.perk}>• Tüm kimlik kategorileri</Text>
              <Text style={styles.perk}>• Banner reklam yok</Text>
              <Text style={styles.perk}>• Sayfa arası geçiş reklamı yok</Text>
              <Text style={styles.perk}>• Kategori açmak için reklam izleme yok</Text>
            </View>
          )}
          {!isPremium ? (
            <View style={styles.premiumActions}>
              <PrimaryButton
                label={busy === 'buy' ? 'Satın alınıyor…' : 'Premium’u aç — reklamsız'}
                onPress={() => void buy()}
                disabled={busy != null}
              />
              <Pressable onPress={() => void restore()} disabled={busy != null} style={styles.restore}>
                {busy === 'restore' ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text style={styles.restoreText}>Satın almayı geri yükle</Text>
                )}
              </Pressable>
            </View>
          ) : null}
          {msg ? <Text style={styles.msg}>{msg}</Text> : null}
        </View>

        <SectionLabel title="Kontrol" subtitle="Eğme, kaydırma ve geri bildirim" />
        <Toggle
          label="Telefonu eğerek oyna"
          hint="Hareket sensörü: yukarı eğ → doğru, aşağı eğ → pas. Kapalıysa sadece kaydır / buton."
          value={prefs.gyroEnabled}
          onChange={(v) => onChange({ ...prefs, gyroEnabled: v })}
        />
        <Toggle
          label="Eğme yönünü ters çevir"
          hint="Cihazında yukarı/aşağı ters geliyorsa aç"
          value={prefs.tiltInverted}
          onChange={(v) => onChange({ ...prefs, tiltInverted: v })}
        />
        <Toggle
          label="Titreşim (haptics)"
          value={prefs.hapticsEnabled}
          onChange={(v) => onChange({ ...prefs, hapticsEnabled: v })}
        />
        <Toggle
          label="Oyun sırasında ekran uyanık kalsın"
          value={prefs.keepAwake}
          onChange={(v) => onChange({ ...prefs, keepAwake: v })}
        />

        <SectionLabel title="Kart & skor" />
        <Toggle
          label="Kart yazısı XL"
          hint="Alından okunaklı büyük tip"
          value={prefs.cardTextScale === 'xl'}
          onChange={(v) => onChange({ ...prefs, cardTextScale: v ? 'xl' : 'normal' })}
        />
        <Toggle
          label="Pas cezası (−1)"
          hint="Kapalıyken pas puansız"
          value={prefs.passPenalty === 1}
          onChange={(v) => onChange({ ...prefs, passPenalty: v ? 1 : 0 })}
        />

        <SectionLabel title="Varsayılan masa" subtitle="Hemen oyna / yeni masa için başlangıç" />
        <Text style={styles.inlineLabel}>Tur süresi</Text>
        <View style={styles.row}>
          {([45, 60, 90] as const).map((s) => (
            <CategoryChip
              key={s}
              label={`${s} sn`}
              selected={prefs.defaultDurationSec === s}
              onPress={() => onChange({ ...prefs, defaultDurationSec: s })}
            />
          ))}
        </View>
        <Text style={styles.inlineLabel}>Zorluk temposu</Text>
        <View style={styles.row}>
          {(
            [
              ['relaxed', 'Rahat'],
              ['classic', 'Klasik'],
              ['brave', 'Cesur'],
            ] as const
          ).map(([id, label]) => (
            <CategoryChip
              key={id}
              label={label}
              selected={prefs.defaultTempo === id}
              onPress={() => onChange({ ...prefs, defaultTempo: id })}
            />
          ))}
        </View>

        <SectionLabel title="Paketler" />
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {isPremium || packsUnlocked
              ? 'Tüm kategoriler açık'
              : 'Genel paket aktif'}
          </Text>
          <Text style={styles.infoBody}>
            {isPremium
              ? 'Premium ile kilit yok.'
              : packsUnlocked
                ? 'Reklam bir kez izlendi. İstediğin kategoriyi seçebilirsin.'
                : 'Diğer kategoriler için masa kurarken 1 kısa reklam yeter — veya Premium.'}
          </Text>
        </View>

        <SectionLabel title="Yardım" />
        <PrimaryButton label="Kurulumu yeniden göster" variant="ghost" onPress={onReplayOnboarding} />

        <View style={styles.aboutBlock}>
          <SectionLabel title="Hakkında" />
          <PrimaryButton label="Hakkında & uyarılar" variant="ghost" onPress={onAbout} />
          <Text style={styles.disclaimer}>
            Tahmin oyunu — resmi lisanslı ürün değildir.
          </Text>
        </View>
      </ScrollView>
      <AdBanner enabled={!isPremium} />
      </View>
    </ScreenAtmosphere>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.rowSwitch}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#3A3D48', true: colors.accent }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  sub: { fontFamily: fonts.body, color: colors.muted, marginVertical: space.md, lineHeight: 22 },
  premiumHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  premiumOn: { borderColor: 'rgba(240,180,41,0.55)' },
  premiumActions: { marginTop: space.md, gap: space.sm },
  restore: { alignItems: 'center', paddingVertical: space.sm },
  restoreText: { fontFamily: fonts.bodySemi, color: colors.accent, fontSize: 14 },
  msg: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  rowSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    gap: space.md,
  },
  label: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 15 },
  hint: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md },
  inlineLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 13,
    marginBottom: space.sm,
  },
  infoBox: {
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.2)',
  },
  infoTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  infoBody: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  perkList: { marginTop: 4, gap: 4 },
  perk: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  aboutBlock: {
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(154,149,140,0.28)',
  },
  disclaimer: {
    marginTop: space.lg,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
