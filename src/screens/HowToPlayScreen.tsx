import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = { onBack: () => void; onPlay?: () => void };

const STEPS = [
  {
    mark: '01',
    title: 'Alnına koy',
    body: 'Tahmin sırası sende. Telefonu alnına koy; yazıyı sen görme, masa görsün.',
    accent: colors.accent,
  },
  {
    mark: '02',
    title: 'Masa ipucu versin',
    body: 'Masadakiler karakteri tarif eder — ismi söylemez. Kartta küçük bir ipucu da çıkar.',
    accent: '#7EB6FF',
  },
  {
    mark: '03',
    title: 'Doğru veya pas',
    body: 'Bildin: yukarı kaydır ya da DOĞRU.\nTakıldın: aşağı kaydır ya da PAS.',
    accent: colors.correct,
  },
  {
    mark: '04',
    title: 'Süre bitene kadar',
    body: 'Tur boyunca peş peşe kart açarsın. Süre dolunca puan gelir, sıra diğerine geçer.',
    accent: colors.hard,
  },
] as const;

export function HowToPlayScreen({ onBack, onPlay }: Props) {
  return (
    <ScreenAtmosphere>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackHeader onBack={onBack} />
        <Text style={styles.kicker}>MASA REHBERİ</Text>
        <Text style={styles.title}>Nasıl oynanır?</Text>
        <Text style={styles.lead}>
          Tek telefon, aynı masa. Tahmin eden alır telefonu; diğerleri ipucu verir.
        </Text>

        <View style={styles.demoRow}>
          <View style={[styles.demoChip, styles.demoPass]}>
            <Text style={styles.demoArrow}>↓</Text>
            <Text style={styles.demoLabel}>PAS</Text>
            <Text style={styles.demoHint}>Aşağı kaydır</Text>
          </View>
          <View style={styles.demoDivider}>
            <Text style={styles.demoDividerText}>veya</Text>
          </View>
          <View style={[styles.demoChip, styles.demoOk]}>
            <Text style={styles.demoArrow}>↑</Text>
            <Text style={styles.demoLabel}>DOĞRU</Text>
            <Text style={styles.demoHint}>Yukarı kaydır</Text>
          </View>
        </View>

        {STEPS.map((s) => (
          <View key={s.mark} style={styles.step}>
            <View style={[styles.markWrap, { borderColor: `${s.accent}66` }]}>
              <Text style={[styles.mark, { color: s.accent }]}>{s.mark}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.note}>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Telefonu eğerek de olur</Text>
            <Text style={styles.noteBody}>
              Yukarı eğ = doğru, aşağı eğ = pas. İstemezsen Ayarlar’dan kapat; kaydırma ve butonlar
              yeterli.
            </Text>
          </View>
        </View>

        {onPlay ? (
          <PrimaryButton label="Hemen oyna" onPress={onPlay} style={{ marginTop: space.lg }} />
        ) : null}
      </ScrollView>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  kicker: {
    fontFamily: fonts.card,
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: space.xs,
  },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.ink, letterSpacing: -0.8 },
  lead: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: space.sm,
    marginBottom: space.lg,
  },
  demoChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  demoPass: {
    borderColor: 'rgba(255,107,74,0.55)',
    backgroundColor: 'rgba(255,107,74,0.12)',
  },
  demoOk: {
    borderColor: 'rgba(61,220,151,0.55)',
    backgroundColor: 'rgba(61,220,151,0.12)',
  },
  demoArrow: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  demoLabel: {
    marginTop: 6,
    fontFamily: fonts.card,
    fontSize: 14,
    letterSpacing: 1.4,
    color: colors.ink,
  },
  demoHint: {
    marginTop: 4,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  demoDivider: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoDividerText: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
  },
  step: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.md,
    backgroundColor: colors.bgElev,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'rgba(154,149,140,0.18)',
    alignItems: 'flex-start',
  },
  markWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  mark: {
    fontFamily: fonts.card,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  stepBody: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  note: {
    marginTop: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.28)',
    backgroundColor: 'rgba(240,180,41,0.07)',
  },
  noteTitle: { fontFamily: fonts.bodyBold, color: colors.accent, fontSize: 14 },
  noteBody: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
    opacity: 0.9,
  },
});
