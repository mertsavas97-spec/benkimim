import { POINTS, type Card, type Difficulty, type MatchSettings } from './types';

export function pointsForCorrect(difficulty: Difficulty): number {
  return POINTS[difficulty];
}

export function pointsForPass(settings: MatchSettings): number {
  return settings.passPenalty === 0 ? 0 : -settings.passPenalty;
}

export function applyCorrect(
  card: Card,
): { points: number; difficulty: Difficulty } {
  return { points: pointsForCorrect(card.difficulty), difficulty: card.difficulty };
}

export function applyPass(settings: MatchSettings): { points: number } {
  return { points: pointsForPass(settings) };
}
