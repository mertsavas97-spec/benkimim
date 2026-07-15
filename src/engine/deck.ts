import { TEMPO_MIX, type Card, type Difficulty, type DifficultyTempo, type DeckState } from './types';

/** Mulberry32 — seed'li deterministik PRNG */
export function createRng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function pickDifficulty(tempo: DifficultyTempo, rng: () => number): Difficulty {
  const mix = TEMPO_MIX[tempo];
  const r = rng();
  if (r < mix.easy) return 'easy';
  if (r < mix.easy + mix.medium) return 'medium';
  return 'hard';
}

function streakOk(
  last: Difficulty[],
  next: Difficulty,
  maxHardStreak: number,
): boolean {
  if (last.length < 2) return true;
  const a = last[last.length - 1];
  const b = last[last.length - 2];
  if (a === next && b === next) return false;
  if (next === 'hard') {
    let streak = 0;
    for (let i = last.length - 1; i >= 0; i -= 1) {
      if (last[i] === 'hard') streak += 1;
      else break;
    }
    if (streak >= maxHardStreak) return false;
  }
  return true;
}

function categoryOk(lastCats: string[], nextCat: string): boolean {
  if (lastCats.length < 2) return true;
  return !(lastCats[lastCats.length - 1] === nextCat && lastCats[lastCats.length - 2] === nextCat);
}

export function filterArchive(
  archive: Card[],
  opts: { categories: string[]; customWordsOnly: boolean },
): Card[] {
  return archive.filter((c) => {
    if (opts.customWordsOnly) return c.categoryId === 'custom';
    if (opts.categories.length > 0 && !opts.categories.includes(c.categoryId)) {
      return false;
    }
    return true;
  });
}

/** Balanced pack: hedef tempo’ya yakın dağılım + shuffle */
export function buildDeck(
  archive: Card[],
  opts: {
    seed: string;
    tempo: DifficultyTempo;
    categories: string[];
    customWordsOnly: boolean;
    targetSize?: number;
  },
): DeckState {
  const rng = createRng(opts.seed);
  const pool = shuffleInPlace(
    [...filterArchive(archive, { categories: opts.categories, customWordsOnly: opts.customWordsOnly })],
    rng,
  );
  const byDiff: Record<Difficulty, Card[]> = { easy: [], medium: [], hard: [] };
  for (const c of pool) {
    byDiff[c.difficulty].push(c);
  }

  const target = opts.targetSize ?? Math.min(80, pool.length);
  const queue: Card[] = [];
  const lastDifficulties: Difficulty[] = [];
  const lastCategoryIds: string[] = [];
  const used = new Set<string>();

  let guard = 0;
  while (queue.length < target && used.size < pool.length && guard < target * 40) {
    guard += 1;
    let desired = pickDifficulty(opts.tempo, rng);
    let attempts = 0;
    while (!streakOk(lastDifficulties, desired, 2) && attempts < 8) {
      desired = pickDifficulty(opts.tempo, rng);
      attempts += 1;
    }

    const candidates = byDiff[desired].filter(
      (c) =>
        !used.has(c.id) &&
        categoryOk(lastCategoryIds, c.categoryId),
    );
    let pick = candidates[0];
    if (!pick) {
      const fallback = pool.find(
        (c) =>
          !used.has(c.id) &&
          streakOk(lastDifficulties, c.difficulty, 2) &&
          categoryOk(lastCategoryIds, c.categoryId),
      );
      if (!fallback) {
        const any = pool.find((c) => !used.has(c.id));
        if (!any) break;
        pick = any;
      } else {
        pick = fallback;
      }
    }

    used.add(pick.id);
    queue.push(pick);
    lastDifficulties.push(pick.difficulty);
    if (lastDifficulties.length > 8) lastDifficulties.shift();
    lastCategoryIds.push(pick.categoryId);
    if (lastCategoryIds.length > 8) lastCategoryIds.shift();
  }

  return {
    queue,
    seenIds: [],
    lastDifficulties: [],
    lastCategoryIds: [],
  };
}

export function drawNextCard(
  deck: DeckState,
  opts: { noRepeatInMatch: boolean; maxHardStreak: number },
): { card: Card | null; deck: DeckState } {
  const queue = [...deck.queue];
  if (queue.length === 0) {
    return { card: null, deck };
  }

  let index = 0;
  for (let i = 0; i < queue.length; i += 1) {
    const c = queue[i];
    if (opts.noRepeatInMatch && deck.seenIds.includes(c.id)) continue;
    if (!streakOk(deck.lastDifficulties, c.difficulty, opts.maxHardStreak)) continue;
    if (!categoryOk(deck.lastCategoryIds, c.categoryId)) continue;
    index = i;
    break;
  }

  const [card] = queue.splice(index, 1);
  if (!card) {
    return { card: null, deck: { ...deck, queue } };
  }

  const lastDifficulties = [...deck.lastDifficulties, card.difficulty].slice(-8);
  const lastCategoryIds = [...deck.lastCategoryIds, card.categoryId].slice(-8);
  const seenIds = opts.noRepeatInMatch
    ? [...deck.seenIds, card.id]
    : deck.seenIds;

  return {
    card,
    deck: { queue, seenIds, lastDifficulties, lastCategoryIds },
  };
}
