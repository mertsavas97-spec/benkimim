# Team Roster & Skill Map

> Koordinatör her sprint/task başında bu dosyayı okur.

## Ekipler

| Ekip ID | Ad | Sorumluluk | Lead skill(ler) |
|---------|-----|------------|-----------------|
| `product` | Product & Copy | Brief, wording, freemium, ASO | **`wording-copywriter`**, `product-discovery`, `pricing-strategy` |
| `design` | Design & UX | Moodboard fidelity, DESIGN.md, ekran IA | **`benkimim-design`**, `$design`, `ui-design-system` |
| `mobile` | Mobile (RN/Expo) | Ekran implementasyonu, motor, offline | `benkimim-design` (UI), **`wording-copywriter`** (string) |
| `visual-qa` | Visual QA | Moodboard vs simülator screenshot skor | **`benkimim-visual-qa`**, `$visual-ralph` |
| `growth` | Growth & Launch | Store, funnel, paywall | `launch-strategy`, `app-store-optimization` |
| `qa` | Eng QA & Release | Typecheck, lint, engine/Maestro smoke | `code-reviewer`, `ship-gate` |
| `guardian` | Product Guardian | Scope, telif, adult, **anti-overclaim** | **`benkimim-guardian`** |
| `finance-domain` | Finance (opsiyonel) | — | Kapalı (bu ürün) |

## Proje-local skills (öncelikli)

| Skill | Path | Ne zaman |
|-------|------|----------|
| **`wording-copywriter`** | `.agents/skills/wording-copywriter/` | Kullanıcıya görünen **her** metin (label, buton, hata, onboarding, rozet, sonuç, +18, store) |
| `benkimim-design` | `.agents/skills/benkimim-design/` | Her UI/ekran işi; moodboard SoT |
| `benkimim-visual-qa` | `.agents/skills/benkimim-visual-qa/` | UI bitiş iddiası / design skor |
| `benkimim-guardian` | `.agents/skills/benkimim-guardian/` | Scope + skor enflasyonu veto |

## OMX (`.codex/skills/`)

| Skill | Ne zaman |
|-------|----------|
| `$design` | DESIGN.md contract refresh (moodboard’a bağla) |
| `$visual-ralph` | Moodboard frame’e pixel/fidelity loop |
| `$plan` / `$ralplan` | Epic / ekran map sprint planı |
| `$ralph` / `$team` | Çok ekranlı paralel implementasyon |
| `$code-review` | Diff review |
| `$ask` | Harici ikinci görüş |

## Routing (güncel)

1. UI/design isteği → **`benkimim-design` zorunlu** (bypass yok).
2. Kullanıcıya görünen metin (yeni veya düzenleme) → **`wording-copywriter` zorunlu** (bypass yok). Layout + copy birlikteyse: önce/birlikte `benkimim-design` + `wording-copywriter`.
3. “Bitti / skor / MVP ready” → **`benkimim-visual-qa` + simülator screenshot** yoksa gate FAIL.
4. Eng QA (`typecheck/lint/smoke`) **ayrı**; visual QA’nın yerine geçmez.
5. Guardian: overclaim (+ copy lock ihlali) veto.
6. Kullanıcıya sadece Koordinatör konuşur.

## Dual score (zorunlu)

Her anlamlı UI/sprint kapanışında iki skor:

- **Product checklist** — brief §11 özellik var mı?
- **Visual (moodboard)** — simülator ≈ `docs/design/moodboard-mvp-1.0.png`?

**Ship claim = min(product, visual)** (veya açıkça “prototype only”).
