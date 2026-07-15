import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
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
import { CATEGORY_META, loadAllCards } from '../data/loadPacks';
import type { Difficulty } from '../engine/types';
import type { CustomWord } from '../storage/customWords';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = {
  initial: CustomWord[];
  onSave: (words: CustomWord[]) => void;
  onBack: () => void;
};

type DraftRow = {
  text: string;
  difficulty: Difficulty;
  hint: string;
  categoryId: string;
};

type Feedback = { type: 'ok' | 'warn' | 'info'; message: string } | null;

function norm(s: string) {
  return s.trim().toLocaleLowerCase('tr-TR');
}

export function CustomWordsScreen({ initial, onSave, onBack }: Props) {
  const archiveNames = useMemo(() => {
    const set = new Set<string>();
    for (const c of loadAllCards()) set.add(norm(c.text));
    return set;
  }, []);

  const categories = useMemo(
    () => Object.values(CATEGORY_META).filter((c) => c.group === 'who' && c.id !== 'custom'),
    [],
  );

  const [rows, setRows] = useState<DraftRow[]>(() =>
    initial.length
      ? initial.map((w) => ({
          text: w.text,
          difficulty: w.difficulty ?? 'medium',
          hint: w.hint ?? '',
          categoryId: w.categoryId ?? 'unlu',
        }))
      : [],
  );
  const [draftName, setDraftName] = useState('');
  const [draftHint, setDraftHint] = useState('');
  const [draftDiff, setDraftDiff] = useState<Difficulty>('medium');
  const [draftCat, setDraftCat] = useState('unlu');
  const [bulk, setBulk] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fade]);

  function showFb(type: NonNullable<Feedback>['type'], message: string) {
    setFeedback({ type, message });
  }

  function addOne() {
    const text = draftName.trim();
    if (!text) {
      showFb('warn', 'Önce bir isim yaz.');
      return;
    }
    if (rows.some((r) => norm(r.text) === norm(text))) {
      showFb('warn', `"${text}" zaten kendi listende var.`);
      return;
    }
    const inArchive = archiveNames.has(norm(text));
    setRows((prev) => [
      ...prev,
      {
        text,
        difficulty: draftDiff,
        hint: draftHint.trim(),
        categoryId: draftCat,
      },
    ]);
    setDraftName('');
    setDraftHint('');
    if (inArchive) {
      showFb(
        'info',
        `"${text}" oyunun arşivinde de var — yine de kendi listene eklendi. Masada iki kez çıkabilir.`,
      );
    } else {
      showFb('ok', `"${text}" başarıyla eklendi — arşivde yoktu, masana özel.`);
    }
  }

  function addBulk() {
    const lines = bulk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) {
      showFb('warn', 'Yapıştırılacak satır yok.');
      return;
    }
    let added = 0;
    let dupArchive = 0;
    let dupList = 0;
    setRows((prev) => {
      const next = [...prev];
      const existing = new Set(next.map((r) => norm(r.text)));
      for (const text of lines) {
        if (existing.has(norm(text))) {
          dupList += 1;
          continue;
        }
        if (archiveNames.has(norm(text))) dupArchive += 1;
        next.push({
          text,
          difficulty: 'medium',
          hint: '',
          categoryId: draftCat,
        });
        existing.add(norm(text));
        added += 1;
      }
      return next;
    });
    setBulk('');
    showFb(
      'ok',
      `${added} kart eklendi` +
        (dupList ? ` · ${dupList} listedeydi` : '') +
        (dupArchive ? ` · ${dupArchive} arşivde de vardı` : '') +
        '.',
    );
  }

  return (
    <ScreenAtmosphere>
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BackHeader onBack={onBack} />
          <Text style={styles.title}>Kart Ekle & Düzenle</Text>
          <Text style={styles.lead}>
            Masaya özel kimlikler ekle veya düzenle. İpucu ve kategori seçebilirsin.
          </Text>

          <View style={styles.composer}>
            <Text style={styles.section}>Yeni kimlik</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={styles.input}
              placeholderTextColor={colors.muted}
              placeholder="İsim / karakter"
              autoCapitalize="words"
            />
            <TextInput
              value={draftHint}
              onChangeText={setDraftHint}
              style={styles.input}
              placeholderTextColor={colors.muted}
              placeholder="İpucu (ör. dizi / film adı)"
            />
            <Text style={styles.micro}>Zorluk</Text>
            <View style={styles.row}>
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <CategoryChip
                  key={d}
                  label={d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                  selected={draftDiff === d}
                  onPress={() => setDraftDiff(d)}
                />
              ))}
            </View>
            <Text style={styles.micro}>Kategori</Text>
            <View style={styles.row}>
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.name}
                  selected={draftCat === c.id}
                  onPress={() => setDraftCat(c.id)}
                />
              ))}
            </View>
            <PrimaryButton label="Listeye ekle" onPress={addOne} style={{ marginTop: space.sm }} />
          </View>

          {feedback ? (
            <View
              style={[
                styles.fb,
                feedback.type === 'ok'
                  ? styles.fbOk
                  : feedback.type === 'warn'
                    ? styles.fbWarn
                    : styles.fbInfo,
              ]}
            >
              <Text style={styles.fbText}>{feedback.message}</Text>
            </View>
          ) : null}

          <Text style={[styles.section, { marginTop: space.lg }]}>
            Senin kartların · {rows.length}
          </Text>
          {rows.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="albums-outline" size={28} color={colors.muted} />
              <Text style={styles.emptyTitle}>Henüz kendi kartın yok</Text>
              <Text style={styles.emptyBody}>Yukarıdan isim ekle; burada görüp silebilirsin.</Text>
            </View>
          ) : (
            rows.map((row, i) => (
              <View key={`${row.text}-${i}`} style={styles.card}>
                <View style={styles.cardMain}>
                  <Text style={styles.cardTitle}>{row.text}</Text>
                  <Text style={styles.cardMeta}>
                    {CATEGORY_META[row.categoryId]?.name ?? row.categoryId}
                    {row.hint ? ` · ${row.hint}` : ''}
                    {' · '}
                    {row.difficulty === 'easy'
                      ? 'Kolay'
                      : row.difficulty === 'medium'
                        ? 'Orta'
                        : 'Zor'}
                    {archiveNames.has(norm(row.text)) ? ' · arşivde de var' : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setRows((prev) => prev.filter((_, j) => j !== i));
                    showFb('ok', `"${row.text}" listeden silindi. Kaydet’e basmayı unutma.`);
                  }}
                  hitSlop={10}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.text} sil`}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.pass} />
                </Pressable>
              </View>
            ))
          )}

          <Text style={[styles.section, { marginTop: space.lg }]}>Toplu yapıştır</Text>
          <Text style={styles.lead}>Her satıra bir isim.</Text>
          <TextInput
            multiline
            value={bulk}
            onChangeText={setBulk}
            style={[styles.input, { minHeight: 100 }]}
            placeholderTextColor={colors.muted}
            placeholder={'İsim 1\nİsim 2\nİsim 3'}
          />
          <PrimaryButton label="Satırları ekle" variant="ghost" onPress={addBulk} />

          <PrimaryButton
            label="Kaydet"
            onPress={() =>
              onSave(
                rows.map((r) => ({
                  text: r.text.trim(),
                  difficulty: r.difficulty,
                  hint: r.hint.trim() || undefined,
                  categoryId: r.categoryId,
                })),
              )
            }
            style={{ marginTop: space.lg }}
          />
        </ScrollView>
      </Animated.View>
    </ScreenAtmosphere>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
    marginBottom: space.sm,
  },
  lead: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: space.md,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 15,
    marginBottom: space.sm,
  },
  micro: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
    marginBottom: 6,
    marginTop: space.sm,
  },
  composer: {
    backgroundColor: colors.bgElev,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.2)',
    marginBottom: space.md,
  },
  input: {
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    color: colors.ink,
    padding: space.md,
    fontFamily: fonts.body,
    marginBottom: space.sm,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  fb: {
    padding: space.md,
    borderRadius: radius.md,
    marginBottom: space.md,
  },
  fbOk: { backgroundColor: 'rgba(61,220,151,0.15)', borderWidth: 1, borderColor: 'rgba(61,220,151,0.4)' },
  fbWarn: { backgroundColor: 'rgba(255,107,74,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,74,0.4)' },
  fbInfo: { backgroundColor: 'rgba(240,180,41,0.12)', borderWidth: 1, borderColor: 'rgba(240,180,41,0.35)' },
  fbText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 14, lineHeight: 20 },
  emptyBox: {
    alignItems: 'center',
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(154,149,140,0.35)',
    marginBottom: space.md,
    gap: space.sm,
  },
  emptyTitle: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 15 },
  emptyBody: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.bgElev,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: 'rgba(154,149,140,0.15)',
  },
  cardMain: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  cardMeta: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: 4 },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,74,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.35)',
  },
});
