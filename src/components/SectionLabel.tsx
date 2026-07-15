import { StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

export function SectionLabel({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.lg, marginBottom: space.sm },
  title: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sub: {
    marginTop: 4,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
  },
});
