/**
 * Kart ipucu audit — text===hint veya aşırı kısa hint FAIL.
 * Usage: npm run audit:hints
 */
import { loadAllCards } from '../src/data/loadPacks';

const cards = loadAllCards();
const same: string[] = [];
const short: string[] = [];

for (const c of cards) {
  const text = c.text.trim();
  const hint = (c.hint ?? '').trim();
  if (text.toLowerCase() === hint.toLowerCase()) {
    same.push(`${c.categoryId} ${c.id} "${text}"`);
  }
  if (hint.length < 3) {
    short.push(`${c.categoryId} ${c.id} "${text}" → "${hint}"`);
  }
}

if (same.length || short.length) {
  console.error('card-hint-audit FAIL', { same: same.length, short: short.length });
  for (const row of same) console.error('  same', row);
  for (const row of short) console.error('  short', row);
  process.exit(1);
}

console.log('card-hint-audit PASS', { cards: cards.length });
