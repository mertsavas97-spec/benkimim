import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  points: number;
  triggerKey: string;
};

export function PlusFloat({ points, triggerKey }: Props) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(12));

  useEffect(() => {
    if (!triggerKey || points <= 0) return;
    opacity.setValue(1);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -28, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [triggerKey, points, opacity, translateY]);

  if (points <= 0) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Text style={styles.text}>+{points}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
  },
  text: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.correct,
  },
});
