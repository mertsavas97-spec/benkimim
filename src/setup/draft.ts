import type { DifficultyTempo, MatchSettings } from '../engine/types';
import { GENERAL_PRESET } from '../data/loadPacks';
import type { AppPrefs } from '../storage/appPrefs';

export type PlayerAvatar = 'f' | 'm';

export type DraftPlayer = {
  id: string;
  name: string;
  avatar: PlayerAvatar;
  /** 0-based takım indeksi (takım modunda) */
  teamIndex: number;
};

export type SetupDraft = {
  mode: 'solo_turn' | 'teams';
  players: DraftPlayer[];
  teamCount: 2 | 3 | 4;
  durationSec: 45 | 60 | 90;
  tempo: DifficultyTempo;
  categories: string[];
  gyroEnabled: boolean;
  tiltInverted: boolean;
  cardTextScale: 'normal' | 'xl';
  passPenalty: 0 | 1;
  quick: boolean;
};

let pid = 0;
export function newPlayer(
  name = '',
  avatar: PlayerAvatar = 'f',
  teamIndex = 0,
): DraftPlayer {
  pid += 1;
  return { id: `dp_${Date.now()}_${pid}`, name, avatar, teamIndex };
}

export const defaultSetup = (quick = false, prefs?: AppPrefs): SetupDraft => {
  const teamCount = 2 as const;
  const names = quick
    ? [
        { name: 'Sen', avatar: 'm' as const },
        { name: 'Misafir', avatar: 'f' as const },
      ]
    : [
        { name: 'Ayşe', avatar: 'f' as const },
        { name: 'Mert', avatar: 'm' as const },
        { name: 'Elif', avatar: 'f' as const },
        { name: 'Can', avatar: 'm' as const },
        { name: 'Zeynep', avatar: 'f' as const },
        { name: 'Deniz', avatar: 'm' as const },
      ];
  return {
    mode: 'solo_turn',
    players: names.map((p, i) => newPlayer(p.name, p.avatar, i % teamCount)),
    teamCount,
    durationSec: prefs?.defaultDurationSec ?? 60,
    tempo: prefs?.defaultTempo ?? 'classic',
    categories: [...GENERAL_PRESET],
    gyroEnabled: prefs?.gyroEnabled ?? true,
    tiltInverted: prefs?.tiltInverted ?? false,
    cardTextScale: prefs?.cardTextScale ?? 'normal',
    passPenalty: prefs?.passPenalty ?? 0,
    quick,
  };
};

export function playerNames(d: SetupDraft): string[] {
  return d.players.map((p) => p.name.trim()).filter(Boolean);
}

export type MatchPlayerSeed = { name: string; teamIndex?: number };

/** Maç motoruna giden oyuncu listesi (isim + isteğe bağlı takım). */
export function matchPlayerSeeds(d: SetupDraft): MatchPlayerSeed[] {
  return d.players
    .filter((p) => p.name.trim().length > 0)
    .map((p) => ({
      name: p.name.trim(),
      teamIndex: d.mode === 'teams' ? p.teamIndex : undefined,
    }));
}

export function withTeamCount(d: SetupDraft, teamCount: 2 | 3 | 4): SetupDraft {
  return {
    ...d,
    teamCount,
    players: d.players.map((p, i) => ({
      ...p,
      teamIndex: p.teamIndex < teamCount ? p.teamIndex : i % teamCount,
    })),
  };
}

export function distributeEvenly(d: SetupDraft): SetupDraft {
  return {
    ...d,
    players: d.players.map((p, i) => ({ ...p, teamIndex: i % d.teamCount })),
  };
}

export function teamsAreReady(d: SetupDraft): boolean {
  if (d.mode !== 'teams') return true;
  const named = d.players.filter((p) => p.name.trim());
  if (named.length < 2) return false;
  const counts = Array.from({ length: d.teamCount }, () => 0);
  for (const p of named) {
    const idx = Math.min(Math.max(0, p.teamIndex), d.teamCount - 1);
    counts[idx] += 1;
  }
  return counts.every((c) => c >= 1);
}

export function draftToSettings(d: SetupDraft): Partial<MatchSettings> {
  return {
    mode: d.mode,
    durationSec: d.durationSec,
    difficultyTempo: d.tempo,
    categories: d.categories.filter((c) => c !== 'adult'),
    teamCount: d.mode === 'teams' ? d.teamCount : undefined,
    gyroEnabled: d.gyroEnabled,
    tiltInverted: d.tiltInverted,
    cardTextScale: d.cardTextScale,
    passPenalty: d.passPenalty,
  };
}

export function applyPrefsToDraft(d: SetupDraft, prefs: AppPrefs): SetupDraft {
  return {
    ...d,
    gyroEnabled: prefs.gyroEnabled,
    tiltInverted: prefs.tiltInverted,
    cardTextScale: prefs.cardTextScale,
    passPenalty: prefs.passPenalty,
    durationSec: prefs.defaultDurationSec,
    tempo: prefs.defaultTempo,
  };
}
