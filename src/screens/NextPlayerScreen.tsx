import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import type { Match } from '../engine/types';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  match: Match;
  onContinue: () => void;
};

export function NextPlayerScreen({ match, onContinue }: Props) {
  const player = match.players[match.turnIndex % match.players.length];
  const turnNo = (match.turnIndex % match.players.length) + 1;
  const total = match.players.length;
  const duration = match.settings.durationSec;
  const team =
    match.settings.mode === 'teams' && match.teams && player?.teamId
      ? match.teams.find((t) => t.id === player.teamId)
      : undefined;

  return (
    <ScreenAtmosphere>
      <View style={styles.root}>
        <Text style={styles.eyebrow}>SIRADA</Text>
        <Text style={styles.name} numberOfLines={2}>
          {player?.name ?? '—'}
        </Text>
        <Text style={styles.turnMeta}>
          {team ? `${team.name} · ` : ''}
          {turnNo}/{total} · {duration} sn
        </Text>

        <Text style={styles.lead}>
          Telefonu alnına koy. Masadakiler tarif etsin — sen kim olduğunu bul.
        </Text>

        <View style={styles.gestureRow}>
          <View style={[styles.gestureCard, styles.passCard]}>
            <Text style={styles.gestureArrow}>↓</Text>
            <Text style={styles.gestureTitle}>PAS</Text>
            <Text style={styles.gestureBody}>Aşağı kaydır{'\n'}veya soldaki PAS</Text>
          </View>
          <View style={[styles.gestureCard, styles.okCard]}>
            <Text style={styles.gestureArrow}>↑</Text>
            <Text style={styles.gestureTitle}>DOĞRU</Text>
            <Text style={styles.gestureBody}>Yukarı kaydır{'\n'}veya sağdaki DOĞRU</Text>
          </View>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timerKicker}>SÜRE</Text>
          <Text style={styles.timerValue}>{duration} sn</Text>
          <Text style={styles.timerBody}>
            Bu süre boyunca peş peşe kart açarsın. Süre bitince tur biter, sıra sonraki oyuncuya
            geçer.
          </Text>
        </View>

        <PrimaryButton
          label="Hazırım"
          onPress={onContinue}
          style={{ marginTop: space.xl, alignSelf: 'stretch' }}
        />
      </View>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.card,
    color: colors.accent,
    letterSpacing: 3,
    fontSize: 13,
    textAlign: 'center',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.ink,
    marginTop: space.sm,
    textAlign: 'center',
    letterSpacing: -1,
  },
  turnMeta: {
    marginTop: space.sm,
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  lead: {
    marginTop: space.lg,
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    opacity: 0.92,
  },
  gestureRow: {
    marginTop: space.xl,
    flexDirection: 'row',
    gap: space.sm,
  },
  gestureCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 140,
  },
  passCard: {
    borderColor: 'rgba(255,107,74,0.5)',
    backgroundColor: 'rgba(255,107,74,0.1)',
  },
  okCard: {
    borderColor: 'rgba(61,220,151,0.5)',
    backgroundColor: 'rgba(61,220,151,0.1)',
  },
  gestureArrow: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
  },
  gestureTitle: {
    marginTop: 6,
    fontFamily: fonts.card,
    fontSize: 16,
    letterSpacing: 1.5,
    color: colors.ink,
  },
  gestureBody: {
    marginTop: 8,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  timerCard: {
    marginTop: space.md,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1.5,
    borderColor: 'rgba(240,180,41,0.35)',
    backgroundColor: 'rgba(240,180,41,0.08)',
  },
  timerKicker: {
    fontFamily: fonts.card,
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  timerValue: {
    marginTop: 4,
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  timerBody: {
    marginTop: 6,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
