import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { space } from '../theme/tokens';
import { fonts } from '../theme/typography';

export type AnswerKind = 'correct' | 'pass' | 'timeout';

type Props = {
  kind: AnswerKind;
  word: string;
  pointsLabel?: string;
  hint?: string;
  onDone: () => void;
};

/**
 * Tek seferlik flash — parent re-render’da (timer tick) yeniden başlamaz.
 */
export function AnswerFlash({ kind, word, pointsLabel, hint, onDone }: Props) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.72));
  const [slide] = useState(() => new Animated.Value(28));
  const onDoneRef = useRef(onDone);
  const finishedRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    finishedRef.current = false;
    opacity.setValue(0);
    scale.setValue(0.72);
    slide.setValue(28);

    const anim = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    anim.start();

    const holdMs = kind === 'timeout' ? 700 : 520;
    const hold = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }).start(
        ({ finished }) => {
          if (!finished || finishedRef.current) return;
          finishedRef.current = true;
          onDoneRef.current();
        },
      );
    }, holdMs);

    return () => {
      clearTimeout(hold);
      anim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only replay when answer identity changes
  }, [kind, word]);

  const bg =
    kind === 'correct'
      ? 'rgba(61,220,151,0.94)'
      : kind === 'pass'
        ? 'rgba(255,107,74,0.94)'
        : 'rgba(180,50,40,0.94)';
  const title = kind === 'correct' ? 'DOĞRU!' : kind === 'pass' ? 'PAS' : 'SÜRE BİTTİ';

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: bg, opacity }]} pointerEvents="none">
      <Animated.View
        style={{ transform: [{ scale }, { translateY: slide }], alignItems: 'center' }}
      >
        <Text style={styles.title}>{title}</Text>
        {pointsLabel ? <Text style={styles.pts}>{pointsLabel}</Text> : null}
        <Text style={styles.word}>{word}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: '#0B0C10',
    letterSpacing: -1,
  },
  pts: {
    marginTop: space.xs,
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: '#0B0C10',
  },
  word: {
    marginTop: space.md,
    fontFamily: fonts.bodySemi,
    fontSize: 22,
    color: '#0B0C10',
    textAlign: 'center',
    paddingHorizontal: space.xl,
    maxWidth: 420,
  },
  hint: {
    marginTop: space.sm,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: 'rgba(11,12,16,0.82)',
    textAlign: 'center',
    paddingHorizontal: space.lg,
  },
});
