import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient as SvgGrad,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme/tokens';

type Variant = 'lobby' | 'play' | 'celebrate' | 'onboarding';

type Props = {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  variant?: Variant;
};

/**
 * Masa gecesi — sıcak lamba, altın toz, ahşap masa masası, soft vignette.
 */
export function ScreenAtmosphere({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  variant = 'lobby',
}: Props) {
  const top =
    variant === 'celebrate'
      ? ['#3A2A12', '#1A1612', '#090A0E']
      : variant === 'play'
        ? ['#101218', '#12141A', '#0A0B10']
        : variant === 'onboarding'
          ? ['#2C1E12', '#16141A', '#0C0D12']
          : ['#2A1C10', '#14161C', '#07080C'];

  const content =
    edges.length === 0 ? (
      <View style={styles.safe}>{children}</View>
    ) : (
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    );

  const showPremiumLobby = variant === 'lobby' || variant === 'onboarding';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={top as [string, string, string]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Sağ üst amber sıcaklık */}
      <LinearGradient
        colors={['rgba(240,140,40,0.16)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.35, y: 0.55 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Üst altın lamba */}
      <LinearGradient
        colors={
          showPremiumLobby
            ? ['rgba(240,180,41,0.44)', 'rgba(240,180,41,0.14)', 'transparent']
            : ['rgba(240,180,41,0.18)', 'rgba(240,180,41,0.05)', 'transparent']
        }
        locations={[0, 0.35, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.lamp}
        pointerEvents="none"
      />

      {showPremiumLobby ? (
        <View style={styles.halo} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
            <Defs>
              <RadialGradient id="goldCore" cx="50%" cy="18%" r="55%">
                <Stop offset="0" stopColor="#F0B429" stopOpacity="0.34" />
                <Stop offset="0.45" stopColor="#F0B429" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#F0B429" stopOpacity="0" />
              </RadialGradient>
              <SvgGrad id="tableTop" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#6B4A28" stopOpacity="0" />
                <Stop offset="0.35" stopColor="#5A3A1C" stopOpacity="0.28" />
                <Stop offset="1" stopColor="#2A180C" stopOpacity="0.55" />
              </SvgGrad>
            </Defs>

            {/* Soft warm wash — nokta/ışık topları yok */}
            <Ellipse cx="195" cy="140" rx="220" ry="180" fill="url(#goldCore)" />

            {/* Masa silueti — katmanlı ahşap */}
            <Path
              d="M0 620 C 70 580, 150 640, 230 600 C 300 568, 350 620, 390 610 L 390 844 L 0 844 Z"
              fill="url(#tableTop)"
            />
            <Path
              d="M0 680 C 100 650, 180 710, 270 670 C 330 645, 365 690, 390 680 L 390 844 L 0 844 Z"
              fill="rgba(90,58,28,0.34)"
            />
            <Path
              d="M0 740 C 120 715, 220 760, 320 735 C 360 720, 380 755, 390 750 L 390 844 L 0 844 Z"
              fill="rgba(35,22,12,0.5)"
            />
            {/* Masa çizgisi */}
            <Path
              d="M24 705 C 120 690, 220 720, 366 698"
              stroke="rgba(240,180,41,0.12)"
              strokeWidth="1.2"
              fill="none"
            />
          </Svg>
        </View>
      ) : (
        <View style={styles.wood} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 844 390" preserveAspectRatio="xMidYMid slice">
            <Defs>
              <SvgGrad id="woodFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000" stopOpacity="0" />
                <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
                <Stop offset="1" stopColor="#000" stopOpacity="0.45" />
              </SvgGrad>
            </Defs>
            <Path
              d="M0 280 C 120 250, 240 300, 400 270 C 560 240, 700 300, 844 280 L 844 390 L 0 390 Z"
              fill="rgba(90,60,30,0.18)"
            />
            <Rect x="0" y="0" width="844" height="390" fill="url(#woodFade)" />
          </Svg>
        </View>
      )}

      {/* Kenar vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0.58)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.18, 0.82, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
        locations={[0.5, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  lamp: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '52%',
  },
  halo: { ...StyleSheet.absoluteFill },
  wood: { ...StyleSheet.absoluteFill },
});
