import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function CategoryChip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.muted,
    backgroundColor: colors.bgElev,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: '#2A2618',
  },
  text: {
    color: colors.muted,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  textSelected: {
    color: colors.accent,
  },
});
