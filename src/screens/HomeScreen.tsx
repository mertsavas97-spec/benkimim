import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { AdBanner } from '../components/AdBanner';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

export type HomeGameMode = 'solo_turn' | 'teams';

type Props = {
  isPremium: boolean;
  onQuickPlay: () => void;
  onStartMode: (mode: HomeGameMode) => void;
  onHowTo: () => void;
  onEditCards: () => void;
  onPacks: () => void;
  onSettings: () => void;
};

/**
 * 3 blok: hero → oyna+modlar → menü.
 * space-between ile boşluk bloklar arasında dağılır; sıkışık üst yığın yok.
 */
export function HomeScreen({
  isPremium,
  onQuickPlay,
  onStartMode,
  onHowTo,
  onEditCards,
  onPacks,
  onSettings,
}: Props) {
  const insets = useSafeAreaInsets();
  const [enter] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <ScreenAtmosphere>
      <View style={styles.shell}>
        <Pressable
          onPress={onSettings}
          hitSlop={14}
          style={[styles.settingsBtn, { top: Math.max(insets.top, 8) }]}
          accessibilityRole="button"
          accessibilityLabel="Ayarlar"
        >
          <Ionicons name="settings-outline" size={22} color={colors.accent} />
        </Pressable>

        <Animated.View
          style={[
            styles.root,
            {
              paddingTop: Math.max(insets.top, 8) + 12,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
              opacity: enter,
            },
          ]}
        >
          {/* Blok 1 — marka */}
          <View style={styles.hero}>
            <View style={styles.logoClip}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.brand}>Ben Kimim?</Text>
            <Text style={styles.tag}>Tek telefon. Aynı masa. Kim olduğunu bul.</Text>
            <Text style={styles.promise}>Alnına koy — masadakiler ipucu versin.</Text>
          </View>

          {/* Blok 2 — CTA + yan yana modlar */}
          <View style={styles.playBlock}>
            <PrimaryButton label="Hemen oyna" onPress={onQuickPlay} />
            <Text style={styles.sectionLabel}>OYUN MODLARI</Text>
            <View style={styles.modeRow}>
              <Pressable
                onPress={() => onStartMode('solo_turn')}
                style={[styles.modeBox, styles.modeSolo]}
                accessibilityRole="button"
              >
                <Ionicons name="person-outline" size={26} color={colors.accent} />
                <Text style={styles.modeTitle}>Sırayla{'\n'}solo</Text>
                <Text style={styles.modeDesc}>Bireysel tur · kişisel skor</Text>
              </Pressable>
              <Pressable
                onPress={() => onStartMode('teams')}
                style={[styles.modeBox, styles.modeTeam]}
                accessibilityRole="button"
              >
                <Ionicons name="people-outline" size={26} color={colors.teamAccent} />
                <Text style={styles.modeTitle}>Takım{'\n'}vs takım</Text>
                <Text style={styles.modeDesc}>Takımlara böl · takım skoru</Text>
              </Pressable>
            </View>
          </View>

          {/* Blok 3 — menü */}
          <View style={styles.menuBlock}>
            <MenuRow icon="help-circle-outline" label="Nasıl oynanır?" onPress={onHowTo} />
            <MenuRow icon="albums-outline" label="Kimlik paketleri" onPress={onPacks} />
            <MenuRow icon="create-outline" label="Kart Ekle & Düzenle" onPress={onEditCards} />
          </View>
        </Animated.View>
        <AdBanner enabled={!isPremium} />
      </View>
    </ScreenAtmosphere>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  settingsBtn: {
    position: 'absolute',
    right: space.lg,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28,31,40,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(240,180,41,0.35)',
  },
  root: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 6,
    paddingRight: 48,
  },
  logoClip: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: colors.bgElev,
  },
  logo: {
    width: 72,
    height: 72,
    transform: [{ scale: 1.1 }],
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink,
    letterSpacing: -1,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    opacity: 0.9,
  },
  promise: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.accent,
    letterSpacing: 0.2,
  },
  playBlock: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: fonts.card,
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 2.2,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeBox: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  modeSolo: {
    backgroundColor: 'rgba(26,30,40,0.92)',
    borderColor: colors.accentBorder,
  },
  modeTeam: {
    backgroundColor: 'rgba(30,26,20,0.92)',
    borderColor: colors.teamBorder,
  },
  modeTitle: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  modeDesc: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  menuBlock: {
    gap: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: 'rgba(28,31,40,0.88)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(240,180,41,0.22)',
    paddingVertical: 14,
    paddingHorizontal: space.md,
  },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 16,
  },
});
