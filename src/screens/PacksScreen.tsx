import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdBanner } from '../components/AdBanner';
import { BackHeader } from '../components/BackHeader';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { categoryIcon } from '../data/categoryIcons';
import { CATEGORY_META, GENERAL_PRESET } from '../data/loadPacks';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = { onBack: () => void; packsUnlocked: boolean; isPremium: boolean };

export function PacksScreen({ onBack, packsUnlocked, isPremium }: Props) {
  const rows = Object.values(CATEGORY_META).filter((c) => c.group === 'who' && c.id !== 'custom');

  return (
    <ScreenAtmosphere>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackHeader onBack={onBack} />
          <Text style={styles.title}>Kimlik paketleri</Text>
          <Text style={styles.sub}>
            Hepsi “kim?” sorusuna cevap. Genel paket ücretsiz
            {packsUnlocked ? '; tüm kategoriler açık.' : '; diğerleri 1 reklamla açılır.'}
          </Text>
          {rows.map((c) => {
            const free = GENERAL_PRESET.includes(c.id);
            const locked = !free && !packsUnlocked;
            return (
              <View key={c.id} style={styles.row}>
                <Ionicons
                  name={categoryIcon(c.id)}
                  size={26}
                  color={locked ? colors.muted : colors.accent}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.meta}>
                    {free ? 'Genel pakette' : packsUnlocked ? 'Açık' : 'Kilitli'}
                  </Text>
                </View>
                {locked ? (
                  <Ionicons name="lock-closed" size={16} color={colors.muted} />
                ) : null}
              </View>
            );
          })}
        </ScrollView>
        <AdBanner enabled={!isPremium} />
      </View>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  sub: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: space.lg,
    marginTop: space.sm,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
  },
  name: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 16 },
  meta: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: 2 },
});
