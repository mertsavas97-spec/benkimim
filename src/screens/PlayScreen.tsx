import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnswerFlash, type AnswerKind } from '../components/AnswerFlash';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { resolveCardHint } from '../data/cardHints';
import type { Match } from '../engine/types';
import { POINTS } from '../engine/types';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  match: Match;
  hapticsEnabled?: boolean;
  keepAwake?: boolean;
  tiltEnabled?: boolean;
  onCorrect: () => void;
  onPass: () => void;
  onTimeUp: () => void;
};

type FlashState = { kind: AnswerKind; word: string; pointsLabel?: string; hint?: string } | null;

const SWIPE_MIN = 64;

export function PlayScreen({
  match,
  hapticsEnabled = true,
  keepAwake = true,
  tiltEnabled,
  onCorrect,
  onPass,
  onTimeUp,
}: Props) {
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState(() => Dimensions.get('window'));
  const [flash, setFlash] = useState<FlashState>(null);
  const [now, setNow] = useState(Date.now());
  const [swipeHint, setSwipeHint] = useState<'correct' | 'pass' | null>(null);
  const tiltArmed = useRef(true);
  const timeUpRef = useRef(false);
  const busyRef = useRef(false);
  const pendingAction = useRef<null | (() => void)>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const gyroOn = tiltEnabled ?? match.settings.gyroEnabled;
  const card = match.round?.currentCard ?? null;
  const guesser =
    match.players.find((p) => p.id === match.round?.guesserId) ??
    match.players[match.turnIndex % match.players.length];
  const scale = match.settings.cardTextScale === 'xl' ? 1.12 : 1;
  const secondsLeft = match.round
    ? Math.max(0, Math.ceil((match.round.endsAt - now) / 1000))
    : 0;
  const hint = card ? resolveCardHint(card) : '';

  const pad = {
    paddingLeft: Math.max(insets.left, 12),
    paddingRight: Math.max(insets.right, 12),
    paddingTop: Math.max(insets.top, 8),
    paddingBottom: Math.max(insets.bottom, 10),
  };

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setLayout(window));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (keepAwake) void activateKeepAwakeAsync('play');
    return () => {
      deactivateKeepAwake('play');
    };
  }, [keepAwake]);

  useEffect(() => {
    dragY.setValue(0);
    cardOpacity.setValue(1);
    cardScale.setValue(1);
  }, [card?.id, dragY, cardOpacity, cardScale]);

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (!match.round || timeUpRef.current || busyRef.current) return;
      if (t >= match.round.endsAt) {
        timeUpRef.current = true;
        busyRef.current = true;
        pendingAction.current = onTimeUp;
        const c = match.round.currentCard;
        setFlash({
          kind: 'timeout',
          word: c?.text ?? '',
          hint: c ? resolveCardHint(c) : undefined,
        });
      }
    }, 200);
    return () => clearInterval(id);
  }, [match.round, onTimeUp]);

  useEffect(() => {
    timeUpRef.current = false;
  }, [match.round?.startedAt]);

  useEffect(() => {
    if (!gyroOn || match.phase !== 'round_active') return;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ y }) => {
      const inverted = match.settings.tiltInverted;
      const up = inverted ? y < -0.55 : y > 0.55;
      const down = inverted ? y > 0.55 : y < -0.55;
      if (!tiltArmed.current) {
        if (Math.abs(y) < 0.22) tiltArmed.current = true;
        return;
      }
      if (up) {
        tiltArmed.current = false;
        void resolveAnswer('correct');
      } else if (down) {
        tiltArmed.current = false;
        void resolveAnswer('pass');
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gyroOn, match.settings.tiltInverted, match.phase, card?.id]);

  function finishFlash() {
    const action = pendingAction.current;
    pendingAction.current = null;
    setFlash(null);
    action?.();
    tiltArmed.current = false;
    setTimeout(() => {
      busyRef.current = false;
    }, 280);
  }

  function resolveAnswer(kind: 'correct' | 'pass') {
    if (!card || match.phase !== 'round_active' || busyRef.current) return;
    busyRef.current = true;
    setSwipeHint(kind);

    if (hapticsEnabled) {
      void Haptics.notificationAsync(
        kind === 'correct'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
    }

    const fly = kind === 'correct' ? -Math.max(360, layout.height * 0.55) : Math.max(360, layout.height * 0.55);

    Animated.parallel([
      Animated.timing(dragY, { toValue: fly, duration: 260, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0.2, duration: 260, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.92, duration: 260, useNativeDriver: true }),
    ]).start(() => {
      pendingAction.current = kind === 'correct' ? onCorrect : onPass;
      const pen = match.settings.passPenalty;
      setFlash({
        kind,
        word: card.text,
        pointsLabel:
          kind === 'correct'
            ? `+${POINTS[card.difficulty]}`
            : pen
              ? `−${pen}`
              : 'Pas',
        hint: resolveCardHint(card),
      });
      dragY.setValue(0);
      cardOpacity.setValue(1);
      cardScale.setValue(1);
      setSwipeHint(null);
    });
  }

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !busyRef.current,
        onMoveShouldSetPanResponder: (_, g) =>
          !busyRef.current && Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx) * 0.7,
        onPanResponderMove: (_, g) => {
          if (busyRef.current) return;
          dragY.setValue(g.dy);
          if (g.dy < -28) setSwipeHint('correct');
          else if (g.dy > 28) setSwipeHint('pass');
          else setSwipeHint(null);
        },
        onPanResponderRelease: (_, g) => {
          if (busyRef.current) return;
          if (g.dy < -SWIPE_MIN || g.vy < -1.1) {
            void resolveAnswer('correct');
            return;
          }
          if (g.dy > SWIPE_MIN || g.vy > 1.1) {
            void resolveAnswer('pass');
            return;
          }
          setSwipeHint(null);
          Animated.spring(dragY, {
            toValue: 0,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          setSwipeHint(null);
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card?.id, match.phase, layout.height],
  );

  const rotate = dragY.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const tintOverlay = dragY.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: [0.35, 0, 0.35],
    extrapolate: 'clamp',
  });

  const wordSize = Math.min(48, Math.max(32, layout.height * 0.11)) * scale;

  if (!card) {
    return (
      <ScreenAtmosphere variant="play" edges={[]}>
        <StatusBar hidden />
        <View style={[styles.center, pad]}>
          <Text style={styles.meta}>Deste bitti</Text>
          <Pressable style={[styles.btn, styles.ok]} onPress={onTimeUp}>
            <Text style={styles.btnText}>Tur bitir</Text>
          </Pressable>
        </View>
      </ScreenAtmosphere>
    );
  }

  return (
    <ScreenAtmosphere variant="play" edges={[]}>
      <StatusBar hidden />
      <View style={[styles.root, pad]}>
        <View style={styles.top}>
          <Text style={styles.meta} numberOfLines={1}>
            {guesser?.name ?? '—'}
          </Text>
          <Text style={[styles.timer, secondsLeft <= 10 && styles.timerWarn]}>{secondsLeft}</Text>
          <Text style={styles.metaRight}>{labelCategory(card.categoryId)}</Text>
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: dragY }, { rotate }, { scale: cardScale }],
            },
          ]}
          {...pan.panHandlers}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.swipeTint,
              {
                opacity: tintOverlay,
                backgroundColor:
                  swipeHint === 'correct'
                    ? colors.correct
                    : swipeHint === 'pass'
                      ? colors.pass
                      : 'transparent',
              },
            ]}
          />
          {swipeHint ? (
            <Text
              style={[
                styles.swipeBadge,
                swipeHint === 'correct' ? styles.swipeBadgeOk : styles.swipeBadgePass,
              ]}
            >
              {swipeHint === 'correct' ? 'DOĞRU ↑' : 'PAS ↓'}
            </Text>
          ) : null}
          <Text style={styles.diff}>{diffLabel(card.difficulty)}</Text>
          <Text style={[styles.word, { fontSize: wordSize }]}>{card.text}</Text>
          <Text style={styles.cardHint}>{hint}</Text>
          <Text style={styles.pts}>+{POINTS[card.difficulty]}</Text>
          <Text style={styles.swipeCue}>↑ kaydır doğru · ↓ kaydır pas</Text>
        </Animated.View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pas"
            disabled={!!flash || busyRef.current}
            style={({ pressed }) => [
              styles.btn,
              styles.pass,
              (pressed || !!flash) && styles.btnDim,
            ]}
            onPress={() => void resolveAnswer('pass')}
          >
            <Text style={styles.btnGlyph}>↓</Text>
            <Text style={styles.btnText}>PAS</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Doğru"
            disabled={!!flash || busyRef.current}
            style={({ pressed }) => [
              styles.btn,
              styles.ok,
              (pressed || !!flash) && styles.btnDim,
            ]}
            onPress={() => void resolveAnswer('correct')}
          >
            <Text style={styles.btnGlyph}>↑</Text>
            <Text style={styles.btnText}>DOĞRU</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          {gyroOn
            ? 'Kaydır / buton / eğ: yukarı doğru · aşağı pas'
            : 'Kaydır veya buton: yukarı doğru · aşağı pas'}
        </Text>

        {flash ? (
          <AnswerFlash
            key={`${flash.kind}:${flash.word}:${flash.pointsLabel ?? ''}`}
            kind={flash.kind}
            word={flash.word}
            pointsLabel={flash.pointsLabel}
            hint={flash.hint}
            onDone={finishFlash}
          />
        ) : null}
      </View>
    </ScreenAtmosphere>
  );
}

function diffLabel(d: string) {
  if (d === 'easy') return 'KOLAY';
  if (d === 'medium') return 'ORTA';
  return 'ZOR';
}

function labelCategory(id: string) {
  const map: Record<string, string> = {
    dizi_tr: 'Yerli dizi',
    dizi_global: 'Yabancı dizi',
    film_karakter: 'Film',
    oyun_karakter: 'Oyun',
    super_kahraman: 'Süper kahraman',
    muzisyen: 'Müzisyen',
    unlu: 'Ünlü',
    sporcu: 'Sporcu',
    tarih_kisi: 'Tarih',
    custom: 'Özel',
  };
  return map[id] ?? id;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontFamily: fonts.bodySemi, color: colors.muted, fontSize: 14, flex: 1 },
  metaRight: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  timer: { fontFamily: fonts.display, fontSize: 40, color: colors.accent, marginHorizontal: space.sm },
  timerWarn: { color: colors.pass },
  card: {
    flex: 1,
    marginVertical: space.sm,
    backgroundColor: 'rgba(28,31,40,0.92)',
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.28)',
    justifyContent: 'center',
    maxHeight: '58%',
    overflow: 'hidden',
  },
  swipeTint: {
    ...StyleSheet.absoluteFill,
  },
  swipeBadge: {
    position: 'absolute',
    top: 16,
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: 1,
    zIndex: 2,
  },
  swipeBadgeOk: { color: colors.correct },
  swipeBadgePass: { color: colors.pass },
  diff: { fontFamily: fonts.bodySemi, color: colors.muted, letterSpacing: 3, marginBottom: space.sm },
  word: { fontFamily: fonts.display, color: colors.ink, textAlign: 'center' },
  cardHint: {
    marginTop: space.sm,
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: space.md,
  },
  pts: { marginTop: space.md, fontFamily: fonts.bodySemi, color: colors.correct, fontSize: 18 },
  swipeCue: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: space.md,
    minHeight: 72,
  },
  btn: {
    flex: 1,
    minHeight: 72,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pass: { backgroundColor: colors.pass },
  ok: { backgroundColor: colors.correct },
  btnDim: { opacity: 0.72 },
  btnGlyph: {
    fontFamily: fonts.bodyBold,
    color: '#0B0C10',
    fontSize: 16,
    marginBottom: 2,
    opacity: 0.7,
  },
  btnText: { fontFamily: fonts.display, color: '#0B0C10', fontSize: 24, letterSpacing: 0.5 },
  hint: {
    textAlign: 'center',
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
});
