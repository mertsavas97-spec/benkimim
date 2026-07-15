import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  title?: string;
  onBack: () => void;
  right?: ReactNode;
};

export function BackHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
        <Text style={styles.back}>← Geri</Text>
      </Pressable>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.md,
    minHeight: 36,
  },
  back: {
    fontFamily: fonts.bodySemi,
    color: colors.accent,
    fontSize: 16,
    marginRight: space.md,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 16,
  },
  right: { minWidth: 48, alignItems: 'flex-end' },
});
