import { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { colors, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  onDone: () => void;
};

/** 3 sahne — Masa Gecesi tonu, çeviri kokusu yok */
const PAGES = [
  {
    kicker: 'NASIL OYNANIR',
    title: 'Alnına koy.',
    body: 'Biriniz telefonu alnına koyar. Diğerleri ipucu verir; tahmin eden kim olduğunu bulur.\n\nHer oyuncu kendi süresince peş peşe kart açar. Süre bitince sıra değişir.',
  },
  {
    kicker: 'DOĞRU / PAS',
    title: 'Yukarı doğru, aşağı pas.',
    body: 'Bildin → yukarı kaydır.\nTakıldın → aşağı kaydır.\n\nKolay +1 · Orta +2 · Zor +3.',
  },
  {
    kicker: 'MASAYA',
    title: 'Masayı kur.',
    body: 'Genel paketle hemen başla. İstersen diğer kategorileri bir kısa reklamla açarsın — önce gülüş.',
  },
] as const;

export function OnboardingScreen({ onDone }: Props) {
  const [page, setPage] = useState(0);
  const last = page === PAGES.length - 1;
  const current = PAGES[page];
  const advancing = useRef(false);

  return (
    <ScreenAtmosphere variant="onboarding">
      <View style={styles.root}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.brand}>Ben Kimim?</Text>
        <Text style={styles.kicker}>{current.kicker}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>

        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
          ))}
        </View>

        <PrimaryButton
          label={last ? 'Hadi başla' : 'Devam'}
          onPress={() => {
            if (advancing.current) return;
            if (last) {
              onDone();
              return;
            }
            advancing.current = true;
            setPage((p) => p + 1);
            advancing.current = false;
          }}
        />
        {!last ? (
          <PrimaryButton
            label="Geç"
            variant="ghost"
            onPress={onDone}
            style={{ marginTop: space.sm }}
          />
        ) : null}
      </View>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  logo: { width: 64, height: 64, borderRadius: 14, marginBottom: space.sm },
  brand: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: space.md,
    letterSpacing: -0.3,
  },
  kicker: {
    fontFamily: fonts.card,
    color: colors.accent,
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: space.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: space.md,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 28,
    color: colors.ink,
    opacity: 0.92,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: space.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(154,149,140,0.35)',
  },
  dotOn: {
    backgroundColor: colors.accent,
    width: 22,
  },
});
