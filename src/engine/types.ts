export type Difficulty = 'easy' | 'medium' | 'hard';

export type CardVisual =
  | { kind: 'none' }
  | { kind: 'photo'; assetId: string }
  | { kind: 'icon'; iconId: string }
  | { kind: 'emoji'; value: string };

export type Card = {
  id: string;
  text: string;
  categoryId: string;
  difficulty: Difficulty;
  visual: CardVisual;
  /** Masadakilere kısa ipucu — örn. dizi/film adı */
  hint?: string;
  region?: 'tr' | 'global' | 'both';
};

export type DifficultyTempo = 'relaxed' | 'classic' | 'brave';

export type MatchSettings = {
  mode: 'solo_turn' | 'teams';
  durationSec: 45 | 60 | 90;
  categories: string[];
  difficultyTempo: DifficultyTempo;
  scoreScheme: 'weighted_123';
  passPenalty: 0 | 1;
  noRepeatInMatch: boolean;
  maxHardStreak: 2;
  turnPolicy: 'everyone_once' | 'fixed_n' | 'first_to_score';
  teamCount?: number;
  guesserPolicy: 'auto_rotate' | 'pick_each_round';
  allowNewCardInLast10Sec: boolean;
  gyroEnabled: boolean;
  tiltInverted: boolean;
  cardTextScale: 'normal' | 'xl';
  customWordsOnly: boolean;
  customWords: { text: string; difficulty?: Difficulty; hint?: string; categoryId?: string }[];
  seed?: string;
};

export type Player = {
  id: string;
  name: string;
  teamId?: string;
  points: number;
  correctByDifficulty: Record<Difficulty, number>;
  passCount: number;
};

export type Team = {
  id: string;
  name: string;
  points: number;
};

export type RoundHistoryItem = {
  cardId: string;
  text: string;
  result: 'correct' | 'pass' | 'timeout';
  difficulty: Difficulty;
  points: number;
};

export type Round = {
  guesserId: string;
  teamId?: string;
  startedAt: number;
  endsAt: number;
  currentCard: Card | null;
  history: RoundHistoryItem[];
  points: number;
};

export type DeckState = {
  queue: Card[];
  seenIds: string[];
  lastDifficulties: Difficulty[];
  lastCategoryIds: string[];
};

export type MatchPhase =
  | 'lobby'
  | 'ready'
  | 'round_active'
  | 'round_end'
  | 'match_end';

export type Match = {
  settings: MatchSettings;
  players: Player[];
  teams?: Team[];
  turnIndex: number;
  deck: DeckState;
  round?: Round;
  phase: MatchPhase;
  archive: Card[];
};

export type TempoMix = { easy: number; medium: number; hard: number };

export const TEMPO_MIX: Record<DifficultyTempo, TempoMix> = {
  relaxed: { easy: 0.6, medium: 0.3, hard: 0.1 },
  classic: { easy: 0.5, medium: 0.35, hard: 0.15 },
  brave: { easy: 0.35, medium: 0.4, hard: 0.25 },
};

export const POINTS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const DEFAULT_SETTINGS: MatchSettings = {
  mode: 'solo_turn',
  durationSec: 60,
  categories: ['unlu', 'dizi_tr', 'film_karakter'],
  difficultyTempo: 'classic',
  scoreScheme: 'weighted_123',
  passPenalty: 0,
  noRepeatInMatch: true,
  maxHardStreak: 2,
  turnPolicy: 'everyone_once',
  guesserPolicy: 'auto_rotate',
  allowNewCardInLast10Sec: true,
  gyroEnabled: true,
  tiltInverted: false,
  cardTextScale: 'normal',
  customWordsOnly: false,
  customWords: [],
};
