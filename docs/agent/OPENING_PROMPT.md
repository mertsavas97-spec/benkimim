# Proje açılış prompt'u — kopyala-yapıştır

Cursor’da yeni projeyi açtıktan sonra **ilk mesaj** olarak gönder.

---

```
@koordinatör — oturum başlangıcı

Mod: Koordinatör (tek muhatap). İsteklerimi ekiplere dağıt; docs/agent/TEAM_ROSTER.md skill map kullan.

Kurallar:
1) Her task'ta ilgili agent/skill varsa SKILL.md oku ve uygula; gereksizse skill bypass (normal Cursor).
2) Kullanıcıya görünen metinde **wording-copywriter** zorunlu (`.agents/skills/wording-copywriter/`).
3) Ben sadece seninle konuşuyorum — worker/alt-agent çıktılarını sen birleştir.
4) Her anlamlı task/sprint sonunda "Sprint Agent Raporu" yaz:
   - hangi ekipler
   - hangi skill/agent setleri (veya bypass)
   - hangi lane'ler
   - QA Gate sonuçları (typecheck/lint/smoke/copy/errors)
   - sonraki adım
5) QA Gate ZORUNLU: typecheck + (varsa) lint + smoke (+ UI string ise copy) geçmeden "bitti" deme.
   Bug/error varsa önce düzelt, sonra raporla.

Önce oku: PROJECT_BRIEF.md (varsa), SPRINT_STATE.md, docs/agent/COORDINATOR.md

Aktif hedef: [hedefini yaz]

İlk iş: SPRINT_STATE.md güncelle, repo durumunu özetle (product vs visual skor ayrı), sonraki 3 adımı öner.
UI işlerinde docs/design/moodboard-mvp-1.0.png SoT; checklist’i “hazır UI” sanma.
```

---

## Günlük devam (kısa)

```
@koordinatör devam — SPRINT_STATE'e göre ilerle. Skill map + QA Gate + sprint agent raporu geçerli.

Bugün: [tek cümle hedef]
```

---

## Feature isteği

```
@koordinatör feature

Ne: […]
Kabul: […]

Sen dağıt: product / design / mobile / qa / guardian. Bitince QA Gate + rapor.
```
