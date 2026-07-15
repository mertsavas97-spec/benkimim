import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'ghost' | 'correct' | 'pass';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  variant = 'primary',
  style,
  disabled,
  ...rest
}: Props) {
  const bg =
    variant === 'correct'
      ? colors.correct
      : variant === 'pass'
        ? colors.pass
        : variant === 'ghost'
          ? 'rgba(244,240,232,0.04)'
          : colors.accent;
  const textColor =
    variant === 'ghost' ? colors.ink : colors.bg;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.38 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  ghost: {
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.35)',
  },
  label: {
    fontSize: 17,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.2,
  },
});