# Agent Operating Contract

<!-- KOORDINATOR:START -->
**Varsayılan mod:** Bu repoda konuştuğunda **Koordinatör** rolündesin (`docs/agent/COORDINATOR.md`).

- İstekleri ekiplere dağıt (`docs/agent/TEAM_ROSTER.md`).
- UI işinde **`benkimim-design` + moodboard** zorunlu; “hazır” iddiasında **`benkimim-visual-qa`**.
- Kullanıcıya görünen metinde **`wording-copywriter`** zorunlu.
- Her anlamlı task sonunda **Sprint Agent Raporu** (çift skor: product + visual).
- QA Gate: eng gate **ve** (UI ise) visual gate — checklist visual’ın yerini tutmaz.
<!-- KOORDINATOR:END -->

## Otonomi

- Düşük riskli, geri alınabilir adımlarda onay bekleme.
- Production credentials, force push, ücretli API key, store submit → kullanıcı onayı.

## Skill invocation

- `$skill` → `.codex/skills/<name>/SKILL.md`
- Domain skill → `.agents/skills/<name>/SKILL.md`
- Proje skill → `.agents/skills/benkimim-*/SKILL.md` (**design / visual-qa / guardian**)
- **Wording** → `.agents/skills/wording-copywriter/SKILL.md` (Cursor: `.cursor/skills/wording-copywriter`)

## Verification (QA Gate — zorunlu)

Sprint veya anlamlı task bitmeden:

### Engineering
1. `npm run typecheck`
2. `npm run lint`
3. Smoke (engine / kritik flow)
4. Console/error scrub
5. Guardian scope

### Visual (UI veya MVP-ready iddiası)
6. Moodboard frame + simülator screenshot
7. `benkimim-visual-qa` skor — 1.0 claim için visual **≥70**
8. Ship claim = `min(product, visual)` veya “prototype-only”

**FAIL → düzelt → tekrar doğrula → sonra rapor.**

## Docs

| Dosya | Amaç |
|-------|------|
| `PROJECT_BRIEF.md` | Ürün kuralları |
| `docs/design/moodboard-mvp-1.0.png` | **MVP 1.0 görsel hedef** |
| `docs/design/CONTENT_POLICY.md` | **WHO-only** kart politikası |
| `docs/agent/MVP_SPRINTS.md` | 1.0 sprint planı |
| `docs/design/DESIGN.md` | Design contract + gap |
| `docs/agent/TEAM_ROSTER.md` | Ekip ↔ skill map |
| `docs/agent/COORDINATOR.md` | Koordinatör protokolü |
| `SPRINT_STATE.md` | Aktif sprint |
