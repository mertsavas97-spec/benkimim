import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { colors, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  guesserName: string;
  onDone: () => void;
};

export function ReadyScreen({ guesserName, onDone }: Props) {
  const [count, setCount] = useState(3);
  const doneRef = useRef(false);
  const [scale] = useState(() => new Animated.Value(0.6));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    scale.setValue(0.55);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [count, scale, opacity]);

  useEffect(() => {
    if (count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 750);
      return () => clearTimeout(t);
    }
    if (!doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [count, onDone]);

  return (
    <ScreenAtmosphere>
      <View style={styles.root}>
        <Text style={styles.hint}>Alnına koy — geri sayım</Text>
        <Text style={styles.name}>{guesserName}</Text>
        <Animated.Text style={[styles.count, { opacity, transform: [{ scale }] }]}>
          {count > 0 ? count : '!'}
        </Animated.Text>
      </View>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  name: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 24,
    marginBottom: space.xl,
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 120,
    color: colors.accent,
  },
});
