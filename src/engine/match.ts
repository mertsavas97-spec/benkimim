import { drawNextCard, buildDeck } from './deck';
import { applyCorrect, applyPass } from './scoring';
import {
  DEFAULT_SETTINGS,
  type Card,
  type Match,
  type MatchSettings,
  type Player,
  type Team,
} from './types';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export type MatchPlayerInput = string | { name: string; teamIndex?: number };

function normalizePlayerInputs(
  inputs: MatchPlayerInput[],
): { name: string; teamIndex?: number }[] {
  return inputs.map((x) => (typeof x === 'string' ? { name: x } : x));
}

export function createPlayers(inputs: MatchPlayerInput[]): Player[] {
  return normalizePlayerInputs(inputs).map(({ name }) => ({
    id: uid('p'),
    name: name.trim() || 'Oyuncu',
    points: 0,
    correctByDifficulty: { easy: 0, medium: 0, hard: 0 },
    passCount: 0,
  }));
}

export function createTeams(
  count: number,
  players: Player[],
  teamIndexes?: (number | undefined)[],
): { teams: Team[]; players: Player[] } {
  const n = Math.max(2, count);
  const teams: Team[] = Array.from({ length: n }, (_, i) => ({
    id: uid('t'),
    name: `Takım ${i + 1}`,
    points: 0,
  }));
  const assigned = players.map((p, i) => {
    const raw = teamIndexes?.[i];
    const idx =
      raw !== undefined && Number.isFinite(raw)
        ? Math.max(0, Math.min(n - 1, Math.floor(raw)))
        : i % n;
    return {
      ...p,
      teamId: teams[idx].id,
    };
  });
  return { teams, players: assigned };
}

function customCardsFromSettings(settings: MatchSettings): Card[] {
  return settings.customWords
    .filter((w) => w.text.trim().length > 0)
    .map((w, i) => {
      const label = w.categoryId?.trim();
      // Freemium: özel kart ASLA ücretli arşiv kategorisini açmaz — hep "custom".
      // Kullanıcı kategorisi yalnızca ipucu yoksa yumuşak ipucu olur.
      const hint =
        w.hint?.trim() ||
        (label && label !== 'custom' ? label.replace(/_/g, ' ') : undefined);
      return {
        id: `custom_${i}_${w.text.trim().toLowerCase().replace(/\s+/g, '_')}`,
        text: w.text.trim(),
        categoryId: 'custom',
        difficulty: w.difficulty ?? 'medium',
        visual: { kind: 'none' as const },
        hint,
      };
    });
}

export function createMatch(
  archive: Card[],
  partial: Partial<MatchSettings>,
  playerInputs: MatchPlayerInput[],
): Match {
  const settings: MatchSettings = { ...DEFAULT_SETTINGS, ...partial };
  const seeds = normalizePlayerInputs(playerInputs);
  let players = createPlayers(seeds);
  let teams: Team[] | undefined;
  if (settings.mode === 'teams') {
    const teamCount = settings.teamCount ?? 2;
    const built = createTeams(
      Math.max(2, teamCount),
      players,
      seeds.map((s) => s.teamIndex),
    );
    players = built.players;
    teams = built.teams;
  }

  const extras = customCardsFromSettings(settings);
  const mergedArchive = [...archive, ...extras];
  // Seçili kategoriler + varsa custom; özel kart etiketi paket kilidini genişletmez.
  const categories = settings.customWordsOnly
    ? ['custom']
    : extras.length > 0
      ? Array.from(new Set([...settings.categories, 'custom']))
      : [...settings.categories];

  const seed = settings.seed ?? `match_${Date.now()}`;
  const deck = buildDeck(mergedArchive, {
    seed,
    tempo: settings.difficultyTempo,
    categories,
    customWordsOnly: settings.customWordsOnly,
  });

  return {
    settings: { ...settings, seed, categories },
    players,
    teams,
    turnIndex: 0,
    deck,
    phase: 'lobby',
    archive: mergedArchive,
  };
}

export function startReady(match: Match): Match {
  return { ...match, phase: 'ready' };
}

export function startRound(match: Match, now = Date.now()): Match {
  const guesser = match.players[match.turnIndex % match.players.length];
  const { card, deck } = drawNextCard(match.deck, {
    noRepeatInMatch: match.settings.noRepeatInMatch,
    maxHardStreak: match.settings.maxHardStreak,
  });

  return {
    ...match,
    deck,
    phase: 'round_active',
    round: {
      guesserId: guesser.id,
      teamId: guesser.teamId,
      startedAt: now,
      endsAt: now + match.settings.durationSec * 1000,
      currentCard: card,
      history: [],
      points: 0,
    },
  };
}

function creditPlayer(
  players: Player[],
  playerId: string,
  delta: { points: number; difficulty?: Card['difficulty']; pass?: boolean },
): Player[] {
  return players.map((p) => {
    if (p.id !== playerId) return p;
    const next = { ...p, points: p.points + delta.points };
    if (delta.difficulty && delta.points > 0) {
      next.correctByDifficulty = {
        ...p.correctByDifficulty,
        [delta.difficulty]: p.correctByDifficulty[delta.difficulty] + 1,
      };
    }
    if (delta.pass) {
      next.passCount = p.passCount + 1;
    }
    return next;
  });
}

function creditTeam(teams: Team[] | undefined, teamId: string | undefined, points: number): Team[] | undefined {
  if (!teams || !teamId) return teams;
  return teams.map((t) => (t.id === teamId ? { ...t, points: t.points + points } : t));
}

export function submitCorrect(match: Match): Match {
  if (!match.round?.currentCard) return match;
  const card = match.round.currentCard;
  const { points, difficulty } = applyCorrect(card);
  const history = [
    ...match.round.history,
    {
      cardId: card.id,
      text: card.text,
      result: 'correct' as const,
      difficulty,
      points,
    },
  ];
  const { card: nextCard, deck } = drawNextCard(match.deck, {
    noRepeatInMatch: match.settings.noRepeatInMatch,
    maxHardStreak: match.settings.maxHardStreak,
  });

  return {
    ...match,
    deck,
    players: creditPlayer(match.players, match.round.guesserId, { points, difficulty }),
    teams: creditTeam(match.teams, match.round.teamId, points),
    round: {
      ...match.round,
      currentCard: nextCard,
      history,
      points: match.round.points + points,
    },
  };
}

export function submitPass(match: Match): Match {
  if (!match.round?.currentCard) return match;
  const card = match.round.currentCard;
  const { points } = applyPass(match.settings);
  const history = [
    ...match.round.history,
    {
      cardId: card.id,
      text: card.text,
      result: 'pass' as const,
      difficulty: card.difficulty,
      points,
    },
  ];
  const { card: nextCard, deck } = drawNextCard(match.deck, {
    noRepeatInMatch: match.settings.noRepeatInMatch,
    maxHardStreak: match.settings.maxHardStreak,
  });

  return {
    ...match,
    deck,
    players: creditPlayer(match.players, match.round.guesserId, {
      points,
      pass: true,
    }),
    teams: creditTeam(match.teams, match.round.teamId, points),
    round: {
      ...match.round,
      currentCard: nextCard,
      history,
      points: match.round.points + points,
    },
  };
}

export function endRound(match: Match): Match {
  return { ...match, phase: 'round_end' };
}

export function advanceTurn(match: Match): Match {
  const nextIndex = match.turnIndex + 1;
  const everyoneOnce = match.settings.turnPolicy === 'everyone_once';
  if (everyoneOnce && nextIndex >= match.players.length) {
    return { ...match, phase: 'match_end', round: undefined };
  }
  return {
    ...match,
    turnIndex: nextIndex,
    phase: 'ready',
    round: undefined,
  };
}

export function endMatch(match: Match): Match {
  return { ...match, phase: 'match_end', round: undefined };
}

export function standings(match: Match): { id: string; name: string; points: number }[] {
  if (match.settings.mode === 'teams' && match.teams) {
    return [...match.teams].sort((a, b) => b.points - a.points);
  }
  return [...match.players].sort((a, b) => b.points - a.points);
}

export function hardHunterBadge(match: Match): Player | null {
  let best: Player | null = null;
  for (const p of match.players) {
    if (!best || p.correctByDifficulty.hard > best.correctByDifficulty.hard) {
      best = p;
    }
  }
  if (!best || best.correctByDifficulty.hard <= 0) return null;
  return best;
}
