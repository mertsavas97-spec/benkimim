# MVP 1.0 Sprint Plan (moodboard + WHO-only)

**Hedef ürün:** Moodboard `docs/design/moodboard-mvp-1.0.png` görsel 1.0 + **kimlik kartları only** (`CONTENT_POLICY.md`)  
**Ship claim kuralı:** `min(product, visual)`; visual ≥70 olmadan “1.0” yok.

## Locked corrections

1. Visual SoT = moodboard (form lobby ≠ 1.0)
2. Content SoT = **WHO / kimlik** — nesne-kelime arşivi ship dışı
3. App icon brand = `assets/icon.png` (BEN KİMİM? parti)

---

## Sprint A — Brand & foundation ✅ (bu tur)

- [x] App icon iOS / Android adaptive / favicon / splash bg
- [x] WHO-only `loadPacks` + CONTENT_POLICY
- [x] Dual-score workflow skills

## Sprint B — Content WHO rebuild ✅

**Ekipler:** product, content, guardian  
**Skills:** `benkimim-guardian`, CONTENT_POLICY  

- [x] Object pack dosyalarını arşivden çıkar veya `_deprecated/` (yemek, hayvan, şehir, …)
- [x] Kimlik destelerini doldur: ünlü, sporcu, tarihî kişi (+ mevcut karakter pack derinliği)
- [x] Adult pack’i durum cümlesinden **tip/kimlik**’e çevir
- [x] Meslek QA: rol kimliği kalsın; nesne kayması yok
- [x] Hedef: her WHO kat ≥60–80 kişi/karakter; total ≥800 kimlik
- [x] Copy: “kelime” → “kimlik / isim” (UI + ASO)

**Bitiş:** guardian PASS + smoke WHO-only ≥800 — **920 kart**

## Sprint C — Moodboard IA shell (frames 01–07) ✅ eng

**Ekipler:** design, mobile, visual-qa  
**Skills:** `benkimim-design`, `benkimim-visual-qa`, `$visual-ralph`  

- [x] 01 Splash (icon)
- [x] 02 Ana menü: Hemen Oyna / Masa Oluştur / Paketler / Özel kimlik
- [x] 03–05 Mod → oyuncu sayısı → takım (stepper; chip-form Lobby öldür)
- [x] 06–07 Ayar özeti + kategori **icon grid**
- [x] Safe-area + moodboard spacing (kısmi)

**Bitiş:** screenshots frames 02+07 — **pending visual evidence**; eng shell landed

## Sprint D — Play loop (frames 08–14) ✅ eng

**Ekipler:** mobile, design, visual-qa  

- [x] 08 Ready checklist (next-player + countdown)
- [x] 09–10 Countdown + Play kart chrome (timer, kategori, PAS/DOĞRU)
- [x] 11–13 Doğru / Pas / Süre bitti overlays
- [x] 14 Sıradaki oyuncu handoff
- [x] Gyro kalibrasyon + cihaz smoke (engine gyro-off path)

**Bitiş:** visual Play ≥65 — **eng done**; screenshot QA open

## Sprint E — Results + custom identity (15–21) ✅ eng

**Ekipler:** mobile, design, visual-qa  

- [x] 15–18 Skor / maç sonu / zorluk detay
- [x] 19–20 Özel kimlik defteri (difficulty picker)
- [x] 21 Gelişmiş ayarlar ekranı

**Bitiş:** full loop screenshots — **eng done**; visual evidence open

## Sprint F — Store polish ⏸ paused

**Ekipler:** growth, guardian, qa  

- [ ] Store screenshots from moodboard-quality builds
- [ ] Age rating + PRIVACY final
- [ ] Icon/ASO copy “parti tahmin / kim?” — kelime oyunu değil

**Bitiş:** submit-ready checklist (onaylı) — **kullanıcı: şimdilik dursun**

---

## Sıra (önerilen)

`A ✅ → B → C → D → E → F`  
B ve C paralel başlayabilir (content vs UI), D content’e bağımlı değil ama kimlik pack’siz parti zayıf.

## Anti-goals

- Kelime/nesne kategorilerini geri getirmek
- Checklist’i visual 1.0 saymak
- Moodboard’suz “UI bitti” skoru
