import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { matchWinnerLine, roundLeaderLine, tieLine } from '../lib/scoreWording';
import { hardHunterBadge, standings } from '../engine';
import type { Match, Player } from '../engine/types';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  match: Match;
  variant: 'round' | 'match';
  onNext: () => void;
  onHome: () => void;
  onEndMatch?: () => void;
  onRematch?: () => void;
};

function correctTotal(p: Player): number {
  return p.correctByDifficulty.easy + p.correctByDifficulty.medium + p.correctByDifficulty.hard;
}

export function ResultsScreen({
  match,
  variant,
  onNext,
  onHome,
  onEndMatch,
  onRematch,
}: Props) {
  const board = standings(match);
  const hunter = hardHunterBadge(match);
  const history = match.round?.history ?? [];
  const [showLog, setShowLog] = useState(false);
  const boardKey = board.map((b) => `${b.id}:${b.points}`).join('|');
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [anim, boardKey]);

  const leader = board[0];
  const maxPts = Math.max(1, ...board.map((b) => b.points));
  const guesser = match.players.find((p) => p.id === match.round?.guesserId);

  const rankedPlayers = [...match.players].sort((a, b) => b.points - a.points);

  const headline =
    variant === 'match'
      ? leader
        ? matchWinnerLine(leader.name)
        : tieLine()
      : leader
        ? roundLeaderLine(leader.name)
        : 'Tur bitti';

  return (
    <ScreenAtmosphere variant="celebrate">
      <ScrollView contentContainerStyle={styles.content}>
        <BackHeader
          title={variant === 'round' ? 'Tur skoru' : 'Maç skoru'}
          onBack={onHome}
        />

        <Text style={styles.kicker}>{variant === 'round' ? 'TUR BİTTİ' : 'MAÇ BİTTİ'}</Text>
        <Text style={styles.headline}>{headline}</Text>
        {variant === 'round' ? (
          <Text style={styles.sub}>
            {guesser
              ? `${guesser.name} · bu tur ${match.round?.points ?? 0} puan`
              : `Bu tur · ${match.round?.points ?? 0} puan`}
          </Text>
        ) : (
          <Text style={styles.sub}>Masa kapandı — skorlar aşağıda.</Text>
        )}

        <Animated.View
          style={[
            styles.board,
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.boardHead}>
            <Text style={styles.headCell}>#</Text>
            <Text style={[styles.headCell, styles.headName]}>
              {match.settings.mode === 'teams' ? 'Takım' : 'Oyuncu'}
            </Text>
            <Text style={[styles.headCell, styles.headPts]}>Puan</Text>
          </View>
          {board.map((row, i) => (
            <View key={row.id} style={[styles.boardRow, i === 0 && styles.boardLead]}>
              <Text style={[styles.rank, i === 0 && styles.rankLead]}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {row.name}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.round((row.points / maxPts) * 100)}%`,
                        backgroundColor: i === 0 ? colors.accent : 'rgba(240,180,41,0.35)',
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.pts}>{row.points}</Text>
            </View>
          ))}
        </Animated.View>

        {variant === 'match' && hunter ? (
          <View style={styles.badgeBox}>
            <Text style={styles.badgeLabel}>Zor avcısı</Text>
            <Text style={styles.badgeName}>{hunter.name}</Text>
            <Text style={styles.badgeHint}>
              En çok zor kart · {hunter.correctByDifficulty.hard}
            </Text>
          </View>
        ) : null}

        {variant === 'round' && history.length > 0 ? (
          <View style={styles.logBox}>
            <Pressable onPress={() => setShowLog((v) => !v)} hitSlop={8}>
              <Text style={styles.logToggle}>
                {showLog ? 'Kart özetini gizle' : `Kart özeti · ${history.length}`}
              </Text>
            </Pressable>
            {showLog ? (
              <View style={styles.logGrid}>
                {history.map((h, idx) => (
                  <View
                    key={`${h.cardId}-${idx}`}
                    style={[
                      styles.chip,
                      h.result === 'correct' ? styles.chipOk : styles.chipPass,
                    ]}
                  >
                    <Text style={styles.chipText} numberOfLines={1}>
                      {h.result === 'correct' ? '✓' : '↔'} {h.text}
                    </Text>
                    <Text style={styles.chipPts}>
                      {h.points >= 0 ? `+${h.points}` : h.points}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {variant === 'match' ? (
          <View style={styles.stats}>
            <Text style={styles.statsKicker}>OYUNCU KARTLARI</Text>
            <Text style={styles.statsTitle}>Detay</Text>
            {rankedPlayers.map((p, i) => {
              const team =
                match.settings.mode === 'teams' && match.teams && p.teamId
                  ? match.teams.find((t) => t.id === p.teamId)
                  : undefined;
              const hits = correctTotal(p);
              const isLead = i === 0;
              return (
                <View
                  key={p.id}
                  style={[styles.playerCard, isLead && styles.playerCardLead]}
                >
                  <View style={styles.playerTop}>
                    <View style={[styles.placePill, isLead && styles.placePillLead]}>
                      <Text style={[styles.placeText, isLead && styles.placeTextLead]}>
                        {i + 1}.
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      {team ? (
                        <Text style={styles.playerTeam}>{team.name}</Text>
                      ) : null}
                    </View>
                    <View style={styles.playerPtsWrap}>
                      <Text style={styles.playerPts}>{p.points}</Text>
                      <Text style={styles.playerPtsLabel}>puan</Text>
                    </View>
                  </View>

                  <View style={styles.diffRow}>
                    <DiffPill label="Kolay" count={p.correctByDifficulty.easy} tone={colors.easy} />
                    <DiffPill label="Orta" count={p.correctByDifficulty.medium} tone={colors.medium} />
                    <DiffPill label="Zor" count={p.correctByDifficulty.hard} tone={colors.hard} />
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaValue}>{hits}</Text>
                      <Text style={styles.metaLabel}>doğru</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaValue}>{p.passCount}</Text>
                      <Text style={styles.metaLabel}>pas</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaValue}>
                        {hits + p.passCount > 0
                          ? `${Math.round((hits / (hits + p.passCount)) * 100)}%`
                          : '—'}
                      </Text>
                      <Text style={styles.metaLabel}>isabet</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <PrimaryButton
          label={variant === 'round' ? 'Sıradaki oyuncu' : 'Ana menü'}
          onPress={variant === 'round' ? onNext : onHome}
          style={{ marginTop: space.lg }}
        />
        {variant === 'round' && onEndMatch ? (
          <PrimaryButton
            label="Maçı bitir"
            variant="ghost"
            onPress={onEndMatch}
            style={{ marginTop: space.sm }}
          />
        ) : null}
        {variant === 'match' && onRematch ? (
          <PrimaryButton
            label="Aynı masayla tekrar"
            variant="ghost"
            onPress={onRematch}
            style={{ marginTop: space.sm }}
          />
        ) : null}
      </ScrollView>
    </ScreenAtmosphere>
  );
}

function DiffPill({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <View style={[styles.diffPill, { borderColor: `${tone}66`, backgroundColor: `${tone}14` }]}>
      <Text style={[styles.diffCount, { color: tone }]}>{count}</Text>
      <Text style={styles.diffLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  kicker: {
    fontFamily: fonts.bodySemi,
    color: colors.accent,
    letterSpacing: 2.5,
    fontSize: 14,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.ink,
    marginTop: space.sm,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginTop: space.sm,
    marginBottom: space.md,
    fontSize: 16,
    lineHeight: 22,
  },
  board: {
    marginTop: space.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.28)',
    backgroundColor: 'rgba(20,22,28,0.94)',
  },
  boardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(154,149,140,0.25)',
  },
  headCell: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 1,
    width: 28,
  },
  headName: { flex: 1, width: undefined },
  headPts: { width: 48, textAlign: 'right' },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: 14,
    gap: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(154,149,140,0.12)',
  },
  boardLead: {
    backgroundColor: 'rgba(240,180,41,0.1)',
  },
  rank: {
    width: 28,
    fontFamily: fonts.display,
    color: colors.muted,
    fontSize: 20,
  },
  rankLead: { color: colors.accent },
  name: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 18,
    marginBottom: 8,
  },
  barTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(154,149,140,0.15)',
    overflow: 'hidden',
  },
  barFill: { height: 5, borderRadius: 3 },
  pts: {
    minWidth: 44,
    textAlign: 'right',
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 26,
  },
  badgeBox: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(196,160,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,160,255,0.35)',
  },
  badgeLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.hard,
    fontSize: 13,
    letterSpacing: 1,
  },
  badgeName: {
    marginTop: 4,
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 22,
  },
  badgeHint: {
    marginTop: 4,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
  },
  logBox: { marginTop: space.lg },
  logToggle: {
    fontFamily: fonts.bodySemi,
    color: colors.accent,
    fontSize: 16,
  },
  logGrid: {
    marginTop: space.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(28,31,40,0.9)',
  },
  chipOk: { borderWidth: 1, borderColor: 'rgba(61,220,151,0.45)' },
  chipPass: { borderWidth: 1, borderColor: 'rgba(255,107,74,0.4)' },
  chipText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 14,
    maxWidth: 200,
  },
  chipPts: { fontFamily: fonts.bodyBold, color: colors.muted, fontSize: 13 },
  stats: { marginTop: space.xl, gap: space.md },
  statsKicker: {
    fontFamily: fonts.card,
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 2,
  },
  statsTitle: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 28,
    marginTop: -4,
    letterSpacing: -0.5,
  },
  playerCard: {
    backgroundColor: colors.bgElev,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1.5,
    borderColor: 'rgba(154,149,140,0.22)',
  },
  playerCardLead: {
    borderColor: 'rgba(240,180,41,0.45)',
    backgroundColor: '#221E14',
  },
  playerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  placePill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(154,149,140,0.3)',
  },
  placePillLead: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(240,180,41,0.14)',
  },
  placeText: {
    fontFamily: fonts.display,
    color: colors.muted,
    fontSize: 16,
  },
  placeTextLead: { color: colors.accent },
  playerName: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 24,
    letterSpacing: -0.4,
  },
  playerTeam: {
    marginTop: 2,
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 13,
  },
  playerPtsWrap: { alignItems: 'flex-end' },
  playerPts: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 32,
    letterSpacing: -0.8,
  },
  playerPtsLabel: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
    marginTop: -2,
  },
  diffRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.md,
  },
  diffPill: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  diffCount: {
    fontFamily: fonts.display,
    fontSize: 22,
  },
  diffLabel: {
    marginTop: 2,
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(154,149,140,0.22)',
    paddingTop: space.sm,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaValue: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 16,
  },
  metaLabel: {
    marginTop: 2,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
});
