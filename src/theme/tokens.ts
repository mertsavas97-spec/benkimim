/** Masa Gecesi — source: docs/design/DESIGN.md */

export const colors = {
  bg: '#12141A',
  bgElev: '#1C1F28',
  surface: '#1A1E28',
  surfaceWarm: '#1E1A14',
  ink: '#F4F0E8',
  muted: '#9A958C',
  accent: '#F0B429',
  accentBorder: 'rgba(240,180,41,0.45)',
  accentSoft: 'rgba(240,180,41,0.12)',
  accentGlow: 'rgba(240,180,41,0.34)',
  teamAccent: '#E07A3A',
  teamBorder: 'rgba(224,122,58,0.45)',
  correct: '#3DDC97',
  pass: '#FF6B4A',
  easy: '#7EB6FF',
  medium: '#F0B429',
  hard: '#C4A0FF',
  overlay: 'rgba(18, 20, 26, 0.72)',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  display: 40,
  card: 56,
  cardMin: 36,
} as const;

export type DifficultyColorKey = 'easy' | 'medium' | 'hard';

export function difficultyColor(d: DifficultyColorKey): string {
  return colors[d];
}
