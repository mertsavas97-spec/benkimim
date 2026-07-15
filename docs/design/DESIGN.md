# Design

## Source of truth

- Status: Active — **moodboard is MVP 1.0 visual target**
- Last refreshed: 2026-07-14
- **Visual SoT:** [`moodboard-mvp-1.0.png`](./moodboard-mvp-1.0.png) (brief’ten üretilmiş ekran map 01–21)
- Product SoT: `PROJECT_BRIEF.md` (oyun kuralları; skor 1/2/3 locked)
- Evidence: simülator Home/Lobby screenshots 2026-07-14 (wireframe; title clip)

## Critical correction

Önceki QA, **özellik checklist**’ini “hazır UI” sanıp yüksek puan verdi.  
Simülator gerçeği: form/chip lobby + notch clip → **visual ~35–40**.  
Bundan sonra skorlar **çift**: Product vs Visual (moodboard).

## Brand

- Personality: Masa Gecesi — sıcak, samimi, akıllı
- Moodboard: dark + warm yellow accent; stepped setup; icon grid kategoriler
- Avoid: Admin form / chip soup / telifli karakter foto

## Product goals

- Goals: offline parti tahmin; solo + takım; alın Play
- Non-goals: online backend; IP görseller

## Information architecture (moodboard)

```
01 Splash → 02 Ana menü (Hemen Oyna / Masa Oluştur / Paketler / Özel kelime)
→ 03 Mod → 04 Oyuncu sayısı → 05 Takım
→ 06 Ayar özeti → 07 Kategori grid
→ 08 Ready checklist → 09–10 Countdown / Play
→ 11–13 Feedback overlays → 14 Sıradaki
→ 15–18 Skor / maç sonu → 19–20 Özel kelime → 21 Ayarlar
```

## Current vs moodboard (gap)

| Moodboard | Repo now | Gap |
|-----------|----------|-----|
| Stepped setup 03–07 | Tek scroll Lobby chip form | **High** |
| Ana menü 4 CTA + ikonlar | 3 text button | High |
| Kategori icon grid | Text chips | High |
| Play feedback screens 11–13 | Flash only | Med |
| Sıradaki oyuncu 14 | Yok | Med |
| Safe-area | Fixed 2026-07-14 | Was fail |
| Visual polish | Atmosphere token only | High |

## Visual language

Token colors remain Masa Gecesi (`src/theme/tokens.ts`).  
Layout/components must converge on **moodboard frames**, not “token = done”.

Logic note: moodboard footer “hard −5” **yok sayılır** — brief locked: hard **+3**.

## Design principles

1. Moodboard frame ID’siz UI PR yok
2. Checklist pass ≠ visual pass
3. Play: kelime + PAS/DOĞRU hierarchy (frame 09)
4. IP: visual none

## Components (target)

Moodboard: icon category tiles, segmented steppers, summary cards, overlay states, result trophy — implement progressively under `src/components/`.

## Accessibility

High contrast Play; icon+label actions; gyro optional.

## Implementation constraints

- Expo RN; `benkimim-design` + `benkimim-visual-qa` skills zorunlu
- `$visual-ralph` for fidelity loops against moodboard crops

## Open questions

- [ ] Moodboard “Kelime Paketleri” store shelf vs in-app pack browser — product
- [ ] Avatar photos on turn handoff — privacy / optional
