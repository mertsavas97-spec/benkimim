import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { CategoryChip } from '../components/CategoryChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { SectionLabel } from '../components/SectionLabel';
import { categoryIcon } from '../data/categoryIcons';
import {
  CATEGORY_META,
  ENTERTAINMENT_PRESET,
  GENERAL_CULTURE_PRESET,
  GENERAL_PRESET,
  isCategoryLocked,
} from '../data/loadPacks';
import type { DraftPlayer, SetupDraft, PlayerAvatar } from '../setup/draft';
import {
  newPlayer,
  playerNames,
  teamsAreReady,
  withTeamCount,
} from '../setup/draft';
import { showRewardedUnlockAd } from '../monetization/ads';
import { savePacksUnlocked } from '../storage/entitlements';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

export type SetupStep = 'players' | 'settings' | 'categories';

type Props = {
  draft: SetupDraft;
  step: SetupStep;
  packsUnlocked: boolean;
  onUnlocked: () => void;
  onChange: (d: SetupDraft) => void;
  onBack: () => void;
  onNext: () => void;
  onStart: () => void;
};

const STEPS: SetupStep[] = ['players', 'settings', 'categories'];

const TEAM_TONES = ['#F0B429', '#7EB6FF', '#3DDC97', '#C4A0FF'] as const;

function patchPlayer(
  draft: SetupDraft,
  id: string,
  patch: Partial<DraftPlayer>,
): SetupDraft {
  return {
    ...draft,
    players: draft.players.map((x) => (x.id === id ? { ...x, ...patch } : x)),
  };
}

export function SetupWizard({
  draft,
  step,
  packsUnlocked,
  onUnlocked,
  onChange,
  onBack,
  onNext,
  onStart,
}: Props) {
  const [watching, setWatching] = useState(false);
  const whoCats = useMemo(
    () => Object.values(CATEGORY_META).filter((c) => c.group === 'who' && c.id !== 'custom'),
    [],
  );
  const stepIndex = Math.max(0, STEPS.indexOf(step));
  const title =
    step === 'players'
      ? draft.mode === 'teams'
        ? 'Takımları kur'
        : 'Kimler masada?'
      : step === 'settings'
        ? 'Tur temposu'
        : 'Kimlik paketleri';

  const usingGeneral =
    draft.categories.length === GENERAL_PRESET.length &&
    GENERAL_PRESET.every((id) => draft.categories.includes(id));

  const canContinue =
    step === 'players'
      ? draft.mode === 'teams'
        ? teamsAreReady(draft)
        : playerNames(draft).length >= 2
      : step === 'settings'
        ? true
        : draft.categories.length >= 1;

  async function unlockPacks() {
    if (watching || packsUnlocked) return;
    setWatching(true);
    const ok = await showRewardedUnlockAd();
    setWatching(false);
    if (ok) {
      await savePacksUnlocked();
      onUnlocked();
    }
  }

  function selectGeneral() {
    onChange({ ...draft, categories: [...GENERAL_PRESET] });
  }

  function toggleCat(id: string) {
    if (isCategoryLocked(id, packsUnlocked)) return;
    const selected = draft.categories.includes(id);
    if (selected) {
      const next = draft.categories.filter((x) => x !== id);
      onChange({ ...draft, categories: next.length ? next : [...GENERAL_PRESET] });
    } else {
      onChange({ ...draft, categories: [...draft.categories, id] });
    }
  }

  function removePlayer(id: string) {
    if (draft.players.length <= 2) return;
    onChange({ ...draft, players: draft.players.filter((x) => x.id !== id) });
  }

  function addToTeam(teamIndex: number) {
    if (draft.players.length >= 12) return;
    onChange({
      ...draft,
      players: [
        ...draft.players,
        newPlayer('', draft.players.length % 2 === 0 ? 'f' : 'm', teamIndex),
      ],
    });
  }

  function renderPlayerEditor(p: DraftPlayer, indexLabel: string, tone?: string) {
    return (
      <View
        key={p.id}
        style={[
          styles.playerCard,
          tone ? { borderColor: `${tone}55` } : null,
        ]}
      >
        <View style={styles.avatarRow}>
          {(['f', 'm'] as PlayerAvatar[]).map((av) => (
            <Pressable
              key={av}
              onPress={() => onChange(patchPlayer(draft, p.id, { avatar: av }))}
              style={[styles.avatarBtn, p.avatar === av && styles.avatarOn]}
            >
              <Ionicons
                name={av === 'f' ? 'woman-outline' : 'man-outline'}
                size={28}
                color={p.avatar === av ? colors.accent : colors.muted}
              />
              <Text style={[styles.avatarLabel, p.avatar === av && styles.avatarLabelOn]}>
                {av === 'f' ? 'Kadın' : 'Erkek'}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={p.name}
          onChangeText={(t) => onChange(patchPlayer(draft, p.id, { name: t }))}
          style={styles.playerInput}
          placeholderTextColor={colors.muted}
          placeholder={indexLabel}
          autoCapitalize="words"
        />
        {draft.players.length > 2 ? (
          <Pressable
            onPress={() => removePlayer(p.id)}
            hitSlop={8}
            style={styles.removeBtn}
            accessibilityLabel="Oyuncuyu kaldır"
          >
            <Ionicons name="trash-outline" size={18} color={colors.pass} />
            <Text style={styles.remove}>Kaldır</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <ScreenAtmosphere>
      <ScrollView contentContainerStyle={styles.content}>
        <BackHeader onBack={onBack} />
        <Text style={styles.progress}>
          Adım {stepIndex + 1} / {STEPS.length}
          {draft.mode === 'teams' ? ' · Takım' : ' · Solo'}
        </Text>
        <Text style={styles.title}>{title}</Text>

        {step === 'players' && draft.mode === 'solo_turn' ? (
          <>
            <Text style={styles.lead}>
              Avatar seç, ismini yaz. En az 2 kişi — en fazla 12.
            </Text>
            {draft.players.map((p, index) =>
              renderPlayerEditor(p, `${index + 1}. oyuncu adı`),
            )}
            {draft.players.length < 12 ? (
              <Pressable
                onPress={() =>
                  onChange({
                    ...draft,
                    players: [
                      ...draft.players,
                      newPlayer('', draft.players.length % 2 === 0 ? 'f' : 'm', 0),
                    ],
                  })
                }
                style={styles.addSolo}
              >
                <Ionicons name="person-add-outline" size={20} color={colors.accent} />
                <Text style={styles.addSoloText}>Oyuncu ekle</Text>
              </Pressable>
            ) : null}
            <Text style={styles.hint}>{playerNames(draft).length} kişi hazır</Text>
          </>
        ) : null}

        {step === 'players' && draft.mode === 'teams' ? (
          <>
            <Text style={styles.lead}>
              Takım sayısını seç. Her takıma kendi oyuncularını ekle veya kaldır. Her takımda en
              az bir isim olmalı.
            </Text>

            <SectionLabel title="Kaç takım?" />
            <View style={styles.row}>
              {([2, 3, 4] as const).map((n) => (
                <CategoryChip
                  key={n}
                  label={`${n} takım`}
                  selected={draft.teamCount === n}
                  onPress={() => onChange(withTeamCount(draft, n))}
                />
              ))}
            </View>

            {Array.from({ length: draft.teamCount }, (_, ti) => {
              const tone = TEAM_TONES[ti];
              const members = draft.players.filter((p) => p.teamIndex === ti);
              return (
                <View
                  key={ti}
                  style={[styles.teamPanel, { borderColor: `${tone}66` }]}
                >
                  <View style={styles.teamHead}>
                    <View style={[styles.teamDot, { backgroundColor: tone }]} />
                    <Text style={[styles.teamTitle, { color: tone }]}>Takım {ti + 1}</Text>
                    <Text style={styles.teamCount}>
                      {members.filter((m) => m.name.trim()).length} kişi
                    </Text>
                  </View>

                  {members.length === 0 ? (
                    <Text style={styles.teamEmpty}>Henüz oyuncu yok</Text>
                  ) : (
                    members.map((p, i) =>
                      renderPlayerEditor(p, `Takım ${ti + 1} · ${i + 1}. isim`, tone),
                    )
                  )}

                  {draft.players.length < 12 ? (
                    <Pressable
                      onPress={() => addToTeam(ti)}
                      style={[styles.addToTeam, { borderColor: `${tone}88` }]}
                    >
                      <Ionicons name="person-add-outline" size={18} color={tone} />
                      <Text style={[styles.addToTeamText, { color: tone }]}>
                        Bu takıma oyuncu ekle
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}

            {!teamsAreReady(draft) ? (
              <Text style={styles.warn}>
                Devam için: en az 2 isim ve her takımda en az bir oyuncu.
              </Text>
            ) : (
              <Text style={styles.hint}>
                {playerNames(draft).length} kişi · {draft.teamCount} takım hazır
              </Text>
            )}
          </>
        ) : null}

        {step === 'settings' ? (
          <>
            <SectionLabel title="Süre" subtitle="Alın turunun süresi" />
            <View style={styles.row}>
              {([45, 60, 90] as const).map((s) => (
                <CategoryChip
                  key={s}
                  label={`${s} sn`}
                  selected={draft.durationSec === s}
                  onPress={() => onChange({ ...draft, durationSec: s })}
                />
              ))}
            </View>
            <SectionLabel title="Zorluk temposu" />
            <View style={styles.row}>
              {(
                [
                  ['relaxed', 'Rahat'],
                  ['classic', 'Klasik'],
                  ['brave', 'Cesur'],
                ] as const
              ).map(([id, label]) => (
                <CategoryChip
                  key={id}
                  label={label}
                  selected={draft.tempo === id}
                  onPress={() => onChange({ ...draft, tempo: id })}
                />
              ))}
            </View>
            {packsUnlocked ? (
              <>
                <SectionLabel title="Hazır karışımlar" />
                <View style={styles.row}>
                  <CategoryChip
                    label="Genel"
                    selected={usingGeneral}
                    onPress={selectGeneral}
                  />
                  <CategoryChip
                    label="Kültür"
                    selected={draft.categories.join() === GENERAL_CULTURE_PRESET.join()}
                    onPress={() => onChange({ ...draft, categories: [...GENERAL_CULTURE_PRESET] })}
                  />
                  <CategoryChip
                    label="Eğlence"
                    selected={draft.categories.join() === ENTERTAINMENT_PRESET.join()}
                    onPress={() => onChange({ ...draft, categories: [...ENTERTAINMENT_PRESET] })}
                  />
                </View>
              </>
            ) : null}
          </>
        ) : null}

        {step === 'categories' ? (
          <>
            <Text style={styles.lead}>
              Varsayılan: Genel paket. Diğer kategoriler bir kısa reklamla bir kez açılır.
            </Text>

            <Pressable
              onPress={selectGeneral}
              style={[styles.generalTile, usingGeneral && styles.generalOn]}
            >
              <Ionicons
                name="sparkles-outline"
                size={28}
                color={usingGeneral ? colors.accent : colors.muted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.generalTitle}>Genel</Text>
                <Text style={styles.generalSub}>Ünlü · Film · Yerli dizi</Text>
              </View>
              {usingGeneral ? <Text style={styles.selectedMark}>Seçili</Text> : null}
            </Pressable>

            {!packsUnlocked ? (
              <Pressable style={styles.unlock} onPress={() => void unlockPacks()} disabled={watching}>
                {watching ? (
                  <ActivityIndicator color={colors.bg} />
                ) : (
                  <>
                    <Text style={styles.unlockTitle}>Tüm kategorileri aç</Text>
                    <Text style={styles.unlockSub}>1 kısa reklam · bir kez yeterli</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Text style={styles.unlockedNote}>Tüm paketler açık — karıştır, seç, başlat.</Text>
            )}

            <SectionLabel title="Kategoriler" />
            <View style={styles.grid}>
              {whoCats.map((c) => {
                const locked = isCategoryLocked(c.id, packsUnlocked);
                const selected = draft.categories.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => (locked ? void unlockPacks() : toggleCat(c.id))}
                    style={[
                      styles.tile,
                      selected && !locked && styles.tileOn,
                      locked && styles.tileLocked,
                    ]}
                  >
                    <Ionicons
                      name={categoryIcon(c.id)}
                      size={28}
                      color={
                        locked
                          ? colors.muted
                          : selected
                            ? colors.accent
                            : colors.ink
                      }
                    />
                    <Text style={[styles.tileLabel, selected && !locked && styles.tileLabelOn]}>
                      {c.name}
                    </Text>
                    {locked ? (
                      <Ionicons
                        name="lock-closed"
                        size={14}
                        color={colors.muted}
                        style={styles.lock}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <PrimaryButton
          label={step === 'categories' ? 'Masayı başlat' : 'Devam'}
          disabled={!canContinue}
          onPress={step === 'categories' ? onStart : onNext}
          style={{ marginTop: space.xl }}
        />
      </ScrollView>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  progress: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginBottom: space.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
    marginBottom: space.sm,
  },
  lead: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: space.md,
    lineHeight: 22,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  teamPanel: {
    marginTop: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: space.md,
    backgroundColor: colors.bgElev,
  },
  teamHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  teamTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    flex: 1,
    letterSpacing: -0.4,
  },
  teamCount: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 13,
  },
  teamEmpty: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginBottom: space.sm,
  },
  addToTeam: {
    marginTop: space.xs,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  addToTeamText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  playerCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.18)',
  },
  avatarRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  avatarBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(154,149,140,0.3)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  avatarOn: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(240,180,41,0.12)',
  },
  avatarLabel: {
    marginTop: 4,
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
  },
  avatarLabelOn: { color: colors.accent },
  playerInput: {
    borderRadius: radius.md,
    backgroundColor: colors.bgElev,
    color: colors.ink,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    borderWidth: 1,
    borderColor: 'rgba(154,149,140,0.25)',
  },
  removeBtn: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    alignSelf: 'flex-end',
  },
  remove: {
    fontFamily: fonts.bodySemi,
    color: colors.pass,
    fontSize: 13,
  },
  addSolo: {
    marginTop: space.xs,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(240,180,41,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244,240,232,0.04)',
  },
  addSoloText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 16,
  },
  hint: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: space.sm },
  warn: {
    fontFamily: fonts.bodySemi,
    color: colors.pass,
    fontSize: 13,
    marginTop: space.sm,
  },
  generalTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bgElev,
    borderWidth: 1.5,
    borderColor: 'rgba(154,149,140,0.25)',
    marginBottom: space.md,
  },
  generalOn: { borderColor: colors.accent, backgroundColor: '#2A2618' },
  generalTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 17 },
  generalSub: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: 2 },
  selectedMark: { fontFamily: fonts.bodySemi, color: colors.accent, fontSize: 13 },
  unlock: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
  },
  unlockTitle: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },
  unlockSub: { fontFamily: fonts.body, color: 'rgba(18,20,26,0.75)', fontSize: 13, marginTop: 2 },
  unlockedNote: {
    fontFamily: fonts.bodySemi,
    color: colors.correct,
    marginBottom: space.md,
    fontSize: 14,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    width: '30%',
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1.5,
    borderColor: 'rgba(154,149,140,0.25)',
    alignItems: 'center',
  },
  tileOn: { borderColor: colors.accent, backgroundColor: '#2A2618' },
  tileLocked: { opacity: 0.55 },
  tileLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  tileLabelOn: { color: colors.accent },
  lock: { marginTop: 4 },
  inline: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 15 },
});
