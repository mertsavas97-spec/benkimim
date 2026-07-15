import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CategoryChip } from '../components/CategoryChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenAtmosphere } from '../components/ScreenAtmosphere';
import { SectionLabel } from '../components/SectionLabel';
import {
  CATEGORY_META,
  CLASSIC_PARTY_PRESET,
  ENTERTAINMENT_PRESET,
  GENERAL_CULTURE_PRESET,
} from '../data/loadPacks';
import type { DifficultyTempo, MatchSettings } from '../engine/types';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  initialNames?: string[];
  quick?: boolean;
  customWordCount: number;
  onOpenCustomWords: () => void;
  onBack: () => void;
  onStart: (payload: {
    settings: Partial<MatchSettings>;
    names: string[];
  }) => void;
};

const TEMPOS: { id: DifficultyTempo; label: string }[] = [
  { id: 'relaxed', label: 'Rahat' },
  { id: 'classic', label: 'Klasik' },
  { id: 'brave', label: 'Cesur' },
];

const PRESETS = [
  { id: 'classic', label: 'Klasik parti', cats: CLASSIC_PARTY_PRESET },
  { id: 'culture', label: 'Genel kültür', cats: GENERAL_CULTURE_PRESET },
  { id: 'fun', label: 'Eğlence dünyası', cats: ENTERTAINMENT_PRESET },
] as const;

export function LobbyScreen({
  initialNames,
  quick,
  customWordCount,
  onOpenCustomWords,
  onBack,
  onStart,
}: Props) {
  const [mode, setMode] = useState<'solo_turn' | 'teams'>('solo_turn');
  const [durationSec, setDurationSec] = useState<45 | 60 | 90>(60);
  const [categories, setCategories] = useState<string[]>(CLASSIC_PARTY_PRESET);
  const [tempo, setTempo] = useState<DifficultyTempo>('classic');
  const [showAdvanced, setShowAdvanced] = useState(!quick);
  const [gyroEnabled, setGyroEnabled] = useState(true);
  const [tiltInverted, setTiltInverted] = useState(false);
  const [cardXl, setCardXl] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  const [passPenalty, setPassPenalty] = useState<0 | 1>(0);
  const [namesText, setNamesText] = useState(
    (initialNames ??
      (quick
        ? ['Oyuncu 1', 'Oyuncu 2']
        : ['Ayşe', 'Mert', 'Elif', 'Can', 'Zeynep', 'Deniz'])
    ).join('\n'),
  );

  const [enter] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [enter]);

  const whoCats = useMemo(
    () => Object.values(CATEGORY_META).filter((c) => c.group === 'who'),
    [],
  );

  const names = namesText
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const canStart =
    names.length >= 2 &&
    (customOnly ? customWordCount >= 2 : categories.length >= 2);

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  return (
    <ScreenAtmosphere>
      <Animated.View style={{ flex: 1, opacity: enter }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{quick ? 'Hızlı oyun' : 'Özel oda'}</Text>
          <Text style={styles.lede}>
            {quick
              ? 'Klasik parti hazır. İsimleri düzelt, başlat.'
              : 'Masayı kur — kategori ve tempo senin.'}
          </Text>

          <SectionLabel title="Preset" />
          <View style={styles.row}>
            {PRESETS.map((p) => (
              <CategoryChip
                key={p.id}
                label={p.label}
                selected={categories.join() === p.cats.join()}
                onPress={() => {
                  setCategories([...p.cats]);
                  setCustomOnly(false);
                }}
              />
            ))}
          </View>

          {!quick ? (
            <>
              <SectionLabel title="Mod" />
              <View style={styles.row}>
                <CategoryChip
                  label="Solo sıra"
                  selected={mode === 'solo_turn'}
                  onPress={() => setMode('solo_turn')}
                />
                <CategoryChip
                  label="Takım"
                  selected={mode === 'teams'}
                  onPress={() => setMode('teams')}
                />
              </View>
              <SectionLabel title="Süre" />
              <View style={styles.row}>
                {([45, 60, 90] as const).map((s) => (
                  <CategoryChip
                    key={s}
                    label={`${s} sn`}
                    selected={durationSec === s}
                    onPress={() => setDurationSec(s)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <SectionLabel title="Oyuncular" subtitle="Her satıra bir isim · min 2" />
          <TextInput
            multiline
            value={namesText}
            onChangeText={setNamesText}
            style={[styles.input, quick && { minHeight: 88 }]}
            placeholderTextColor={colors.muted}
            placeholder={'Ayşe\nMert'}
          />

          {!quick ? (
            <>
              <SectionLabel title="Kimlik desteleri" subtitle="Kim olduğunu tahmin et — nesne/kelime yok" />
              <View style={styles.wrap}>
                {whoCats.map((c) => (
                  <CategoryChip
                    key={c.id}
                    label={c.name}
                    selected={categories.includes(c.id)}
                    onPress={() => toggleCategory(c.id)}
                  />
                ))}
              </View>

              <SectionLabel title="Zorluk temposu" />
              <View style={styles.row}>
                {TEMPOS.map((t) => (
                  <CategoryChip
                    key={t.id}
                    label={t.label}
                    selected={tempo === t.id}
                    onPress={() => setTempo(t.id)}
                  />
                ))}
              </View>

            </>
          ) : null}

          <PrimaryButton
            label={showAdvanced ? 'Gelişmiş gizle' : 'Gelişmiş'}
            variant="ghost"
            onPress={() => setShowAdvanced((s) => !s)}
            style={{ marginTop: space.md }}
          />

          {showAdvanced ? (
            <View style={styles.panel}>
              <ToggleRow label="Gyro eğme" value={gyroEnabled} onChange={setGyroEnabled} />
              <ToggleRow label="Eğ yönü ters" value={tiltInverted} onChange={setTiltInverted} />
              <ToggleRow label="Kart yazısı XL" value={cardXl} onChange={setCardXl} />
              <ToggleRow
                label="Pas cezası (−1)"
                value={passPenalty === 1}
                onChange={(v) => setPassPenalty(v ? 1 : 0)}
              />
              <ToggleRow
                label="Sadece özel kelimeler"
                value={customOnly}
                onChange={setCustomOnly}
              />
              <PrimaryButton
                label={`Kendi kartlarım (${customWordCount})`}
                variant="ghost"
                onPress={onOpenCustomWords}
                style={{ marginTop: space.sm }}
              />
            </View>
          ) : null}

          <PrimaryButton
            label="Başlat"
            disabled={!canStart}
            onPress={() =>
              onStart({
                names,
                settings: {
                  mode: quick ? 'solo_turn' : mode,
                  durationSec: quick ? 60 : durationSec,
                  categories: customOnly ? ['custom'] : categories,
                  difficultyTempo: quick ? 'classic' : tempo,
                  teamCount: mode === 'teams' ? 2 : undefined,
                  gyroEnabled,
                  tiltInverted,
                  cardTextScale: cardXl ? 'xl' : 'normal',
                  customWordsOnly: customOnly,
                  passPenalty,
                },
              })
            }
            style={{ marginTop: space.lg }}
          />
          <PrimaryButton
            label="Geri"
            variant="ghost"
            onPress={onBack}
            style={{ marginTop: space.sm, marginBottom: space.xxl }}
          />
        </ScrollView>
      </Animated.View>
    </ScreenAtmosphere>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#3A3D48', true: colors.accent }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  lede: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    minHeight: 120,
    borderRadius: radius.md,
    backgroundColor: colors.bgElev,
    color: colors.ink,
    padding: space.md,
    fontFamily: fonts.body,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(154,149,140,0.2)',
  },
  panel: {
    marginTop: space.sm,
    padding: space.md,
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(154,149,140,0.15)',
  },
  toggleRow: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  toggleLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 15,
    flex: 1,
  },
});
