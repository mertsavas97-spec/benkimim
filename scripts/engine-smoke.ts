/**
 * MVP archive smoke — WHO-only (kişi/karakter)
 */
import {
  buildDeck,
  createMatch,
  startRound,
  submitCorrect,
  submitPass,
  endRound,
  advanceTurn,
  standings,
} from '../src/engine';
import {
  whoCategoryCount,
  loadAllCards,
  CATEGORY_META,
} from '../src/data/loadPacks';

const archive = loadAllCards();
const whoN = whoCategoryCount();

const byCat: Record<string, number> = {};
for (const c of archive) {
  byCat[c.categoryId] = (byCat[c.categoryId] ?? 0) + 1;
}

console.assert(whoN >= 9, `who cats ${whoN}`);
console.assert(archive.length >= 700, `archive ${archive.length} < 700`);
console.assert(
  archive.every((c) => CATEGORY_META[c.categoryId]),
  'unknown category in archive',
);
console.assert(archive.every((c) => !!c.difficulty), 'missing difficulty');

const banned = [
  'yemek',
  'hayvan',
  'sehir',
  'ev',
  'spor',
  'eylem',
  'duygu',
  'sarki',
  'cizgi_anime',
  'meslek',
];
for (const id of banned) {
  console.assert(!byCat[id], `banned pack still loaded: ${id}`);
}

console.assert(
  archive.every((c) => c.visual.kind === 'none'),
  'persona visual leak',
);
console.assert(
  !archive.some((c) => /^Kimlik\s*\d+$/i.test(c.text)),
  'placeholder Kimlik N still in archive',
);
console.assert(!byCat.adult, 'adult pack still loaded');

let match = createMatch(
  archive,
  {
    mode: 'teams',
    teamCount: 2,
    categories: ['dizi_tr', 'film_karakter', 'muzisyen', 'unlu'],
    seed: 'who-only',
    durationSec: 45,
    gyroEnabled: false,
  },
  [
    { name: 'A', teamIndex: 0 },
    { name: 'B', teamIndex: 0 },
    { name: 'C', teamIndex: 1 },
    { name: 'D', teamIndex: 1 },
    { name: 'E', teamIndex: 1 },
    { name: 'F', teamIndex: 0 },
  ],
);
console.assert(match.teams?.length === 2, 'team count');
console.assert(
  match.players.filter((p) => p.teamId === match.teams![0].id).length === 3,
  'manual team assignment',
);
match = startRound(match);
match = submitCorrect(match);
match = submitPass(match);
match = endRound(match);
match = advanceTurn(match);
console.assert(standings(match).length === 2, 'teams');

const deck = buildDeck(archive, {
  seed: 'x',
  tempo: 'classic',
  categories: ['dizi_tr', 'film_karakter', 'unlu'],
  customWordsOnly: false,
  targetSize: 40,
});

console.log('who-smoke PASS', {
  cards: archive.length,
  whoCategories: whoN,
  deck: deck.queue.length,
  byCat,
});
