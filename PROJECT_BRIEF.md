# Ben Kimim — Agent Handoff Raporu (Eksiksiz)

**Durum:** Ürün / motor / içerik / UI kararları net; **kod repo’su henüz yok** (greenfield).  
**Tarih:** 2026-07-14  
**Dil:** Türkçe ürün (TR-first)  
**Stack tercihi (kurucu):** Expo React Native, freemium + ads/premium mümkün, düşük işletme maliyeti, backendsiz v1  
**Kurucu context:** Mert — Afterlight, TaksitDefter, OtoTakvim, ayrıca mevcut bir **Türkçe kelime oyunu** var. Ben Kimim ayrı parti rafı olarak düşünülüyor (veya ileride kelime app’ine “Parti Modu”; v1 için **ayrı ürün** varsay).

Bu doküman, sonraki agent’ın **hiçbir konuşma geçmişi olmadan** doğru ürünü inşa etmesi için tek kaynak olmalıdır.

---

## 1. Ürün özeti

**Ben Kimim**, yüz yüze (aynı oda) oynanan Türkçe **parti tahmin oyunu**. Klasik Heads Up / alına-telefon mekaniği:

1. Tahminci telefonu alnına koyar (ekran dışarı — anlatıcılar kelimeyi görür).
2. Diğerleri ipucu verir / canlandırır.
3. Doğru veya pas (eğme ve/veya buton).
4. Süre bitince tur skoru; telefon sıradaki oyuncuya / takıma geçer.
5. Maç sonunda zorluk kırılımlı sonuç ekranı.

**Değil:** Online multiplayer lobby, Akinator, solo trivia-first ürün, kelime bulmaca (mevcut kelime oyunuyla çakışmasın).

**Pazar notu:** TR App Store’da “Ben Kimim / Tahmin et / Sessiz Sinema” klonları çok. Kazanmak = TR kültür + IP sentezi + zorluk/puan derinliği + temiz UX + custom kelime. Ayrışmasız klon yapılmayacak.

**Hedef skor (önceki değerlendirme):** Ham klon ~68 · Ayrışmalı ürün ~82/100.

---

## 2. Kesin ürün kararları (locked)

| Karar | Değer |
|---|---|
| Modlar (v1) | **Solo sıra** + **Takım** |
| Oyuncu sayısı | Soft sınırsız (pratik UI soft cap ~24); 2+ |
| Multiplayer / backend | **Yok** — tek cihaz, pass-the-phone |
| Davet kodu / online oda | v1’de zorunlu değil; ileride sadece **ayar+seed paylaşımı** (cloud yok) |
| Gerçek N-telefon sync (P2P) | **v2+** |
| Kart zorluğu | Tüm arşiv: `easy` \| `medium` \| `hard` |
| Puan | Kolay +1, Orta +2, Zor +3 |
| Pas cezası | Default **0** (ayar ile −1 opsiyon) |
| Deck dağılımı (Klasik) | %50 kolay / %35 orta / %15 zor |
| +18 | **Yetişkin masası** — default kapalı, ayrı pack, onaylı |
| IP kategorileri (dizi/film/oyun/müzik) | Var — **sadece metin**, görsel yok |
| Telifli görsel | Film karesi, karakter artı, ünlü foto, logo, arma → **yasak** |
| Ton | Akıllı parti — cringe meme / skibidi / sigma dili yok |
| Görsel yön | **“Masa Gecesi”** (aşağıda token’lar) |

---

## 3. Nasıl oynanır (5–6+ kişi)

### 3.1 Solo sıra (mod: `solo_turn`)

- Her tur 1 tahminci; diğerleri birlikte anlatır.
- Fair default: **herkes 1 tur**.
- Skor **kişiye** yazılır.
- Tur süresi 45 / 60 / 90 sn.

### 3.2 Takım (mod: `teams`)

- 2–N takım; oyuncular manuel veya rastgele bölünür.
- Tur sırayla takımlara geçer.
- Tahminci kendi takımından; default **otomatik rotate**.
- Skor **takım havuzuna** yazılır.
- İkincil istatistik: takım içinde kim kaç zor bildi (sonuç detayı).

### 3.3 Tek cihaz gerçeği

Tahminci telefonu alnında tutar; anlatıcılar ekranı görür. İkinci telefona sync **gerekmez**. “Çoklu oyun” = aynı odada sırayla oyun, online değil.

---

## 4. Oyun motoru (engine)

### 4.1 State machine

```
Lobby → Ready → RoundActive → RoundEnd → NextPlayer/NextTeam → MatchEnd
```

### 4.2 Temel tipler (hedef şema)

```ts
type Difficulty = 'easy' | 'medium' | 'hard'

type CardVisual =
  | { kind: 'none' }
  | { kind: 'photo'; assetId: string }
  | { kind: 'icon'; iconId: string }
  | { kind: 'emoji'; value: string }

type Card = {
  id: string
  text: string
  categoryId: string
  difficulty: Difficulty  // zorunlu — yoksa import reddedilir
  visual: CardVisual
  region?: 'tr' | 'global' | 'both'
  adult?: boolean           // true ise sadece Yetişkin masası açıkken
  tone?: 'witty' | 'flirty' | 'awkward' | 'neutral'
}

type MatchSettings = {
  mode: 'solo_turn' | 'teams'
  durationSec: 45 | 60 | 90
  categories: string[]          // min 2
  difficultyTempo: 'relaxed' | 'classic' | 'brave'
  // relaxed 60/30/10 · classic 50/35/15 · brave 35/40/25
  adultMode: boolean
  scoreScheme: 'weighted_123'   // v1 sabit: 1/2/3
  passPenalty: 0 | 1            // default 0
  noRepeatInMatch: boolean      // default true
  maxHardStreak: 2              // motor
  turnPolicy: 'everyone_once' | 'fixed_n' | 'first_to_score'
  teamCount?: number
  guesserPolicy: 'auto_rotate' | 'pick_each_round'
  allowNewCardInLast10Sec: boolean  // öneri: true
  gyroEnabled: boolean
  tiltInverted: boolean
  customWordsOnly: boolean
  customWords: { text: string; difficulty?: Difficulty }[]
  seed?: string
}

type Player = { id: string; name: string; teamId?: string; points: number }

type Round = {
  guesserId: string
  teamId?: string
  startedAt: number
  endsAt: number
  currentCard: Card | null
  history: {
    cardId: string
    result: 'correct' | 'pass' | 'timeout'
    difficulty: Difficulty
    points: number
  }[]
  points: number
}

type Match = {
  settings: MatchSettings
  players: Player[]
  teams?: { id: string; name: string; points: number }[]
  turnIndex: number
  deck: { queue: Card[]; seenIds: Set<string> }
  round?: Round
}
```

### 4.3 Motor kararları (oyuncu seçmez)

- Seed’li shuffle + balanced pack
- Sonraki kart
- Aynı zorluktan üst üste max 2
- Her ~8 kartta zor kart frekans kontrolü
- Süre bitişi, skor, sıra/takım dönüşü
- Tekrarsızlık
- `adultMode === false` iken adult kart filtre
- IP kartlarında visual zorla `none` (asset yoksa)
- Tie-break: (1) daha çok zor doğru (2) daha az pas (3) daha çok doğru adedi

### 4.4 Puan

| Zorluk | Doğru | Pas (default) |
|---|---|---|
| easy | +1 | 0 |
| medium | +2 | 0 |
| hard | +3 | 0 |

### 4.5 Deck packing

```
Rahat:   easy 60% · medium 30% · hard 10%
Klasik:  easy 50% · medium 35% · hard 15%   ← default
Cesur:   easy 35% · medium 40% · hard 25%

Kurallar:
- Aynı difficulty streak ≤ 2
- Kategori round-robin (aynı kategoriden 3 üst üste yok)
- noRepeatInMatch açıksa seen’e düşen tekrar gelmez
```

**Arşiv hedef dağılımı (içerik edit):** easy ~45–50% · medium ~35–40% · hard ~12–18%. Bir kategoride hard %40+ olursa editlenir.

### 4.6 Minimal API

```ts
submitCorrect(card) → points from difficulty
submitPass(card)    → 0 or -passPenalty
endMatch() → standings + perPlayer difficulty breakdown + badges
```

---

## 5. Lobby ayarları (kullanıcıya açılan)

### 5.1 Birincil (hızlı + özel oda)

| Ayar | Seçenekler | Default |
|---|---|---|
| Mod | Solo sıra / Takım | Solo |
| Süre | 45 / 60 / 90 | 60 |
| Kategoriler | Multi-select (min 2) | “Klasik parti” preset |
| Zorluk temposu | Rahat / Klasik / Cesur | Klasik |
| Yetişkin masası | Off / On (+ onay) | Off |

### 5.2 Oyuncular

- İsim listesi (2+, soft max ~24)
- Solo: liste sırası = tur sırası
- Takım: 2–N takım, sürükle-bırak veya rastgele böl, opsiyonel takım adı

### 5.3 Gelişmiş (chevron altında)

| Ayar | Default |
|---|---|
| Pas cezası | Yok (0) |
| Maç içi tekrarsız | Açık |
| Tur politikası | Herkes 1 tur |
| Tahminci (takım) | Otomatik rotate |
| Gyro | Açık |
| Eğ yönü ters | Kapalı |
| Ekran butonları | **Her zaman var** (gyro opsiyonel) |
| Ses / haptic | Açık |
| Kart yazısı XL | Sistem + ek kontrol |
| Özel kelime listesi | Boş; eklenince default difficulty **medium**, visual **none** |
| Sadece özel kelimeler | Kapalı |

### 5.4 Lobby IA

```
[1] Mod + süre
[2] Oyuncular / takımlar
[3] Kategoriler + preset
[4] Zorluk temposu + Yetişkin masası
[5] Gelişmiş …
[Başlat]

Hızlı oyun: preset tek tap → min 2 isim → başlat
```

---

## 6. Kategoriler ve içerik

### 6.1 İçerik ilkeleri

- Geniş, ilgi çekici, **cringe değil**
- Yerli + global sentez (IP setlerinde TR ~%35–45, global ikon ~%45–55, soft sürpriz ~%5–10)
- “İyi seçim” eşiği: TR 18–35 parti masasında isim duyulunca “ah evet”
- 2010–2026 + kalıcı klasikler; sadece 90’lar dump’ı yok
- Tek fandom dump’ı yok (sadece anime / sadece K-pop)
- Spoiler yan karakter #47 yok
- Ağır politik kişi yok
- Kürasyon ≠ 5000 scrape dump

**Anti-cringe:** Zeki, sıcak, doğru yazım. “Skibidi”, “sigma”, zoraki slang, emoji yağmuru yok.

### 6.2 Core kategoriler (örnek ID’ler)

| ID | İsim | Görsel politikası |
|---|---|---|
| `yemek` | Yemek & Mutfak | photo/icon |
| `meslek` | Meslekler | icon/photo (yüz yok) |
| `hayvan` | Hayvanlar | photo |
| `sehir` | Türkiye & Dünya yerleri | photo (manzara) |
| `ev` | Ev & Eşya | photo/icon |
| `spor` | Spor branşları (kulüpsüz) | icon |
| `eylem` | Canlandır / Eylem | emoji/none |
| `duygu` | Duygular | emoji |
| `okul` | Okul & Yurt | none/icon |
| `is` | Ofis & İş | none/icon |
| `bilim` | Bilim & Uzay | icon |
| `tarih` | Tarih & Mitoloji | icon/none |
| `mutfak_tr` | Anadolu sofrası | photo |
| `aile` | Aile diyaloğu | **none** (metin komikliği) |
| `yolculuk` | Yol & tatil | photo |
| `marka_genel` | Markasız ürün türleri | icon — **logo yok** |

### 6.3 Eğlence dünyası (IP bloğu) — lobby’de ayrı grup

| ID | İsim | Görsel | Not |
|---|---|---|---|
| `dizi_tr` | Yerli dizi karakterleri | **none** | Karakter adı kart |
| `dizi_global` | Yabancı dizi karakterleri | **none** | |
| `film_karakter` | Film karakterleri | **none** | TR+global tek destede (~%30 TR) |
| `oyun_karakter` | Oyun karakterleri | **none** | Ağır global |
| `cizgi_anime` | Çizgi & anime | **none** | Western / anime / Pixar dengesi |
| `super_kahraman` | Süper kahramanlar | **none** | Logo yok |
| `muzisyen` | Müzisyenler | **none** | TR~%40 |
| `sarki` | Şarkılar | **none** | Karaoke-bilinir hit’ler |
| `kitap_karakter` | Kitap (opsiyonel) | **none** | |

**v1 kart hedefi (IP):** kategori başına ~60–100; toplam IP havuzu ~680+ hedeflenmişti. Core her kategori ≥80 kart.

**Örnek kalite referansı (altın seviye — tam yayın listesi değil):**  
Behzat Ç., Yamaç, Ezel, Walter White, Eleven, Michael Scott, Harry Potter, Joker, Shrek, Mario, Pikachu, Kratos, Tarkan, Sezen Aksu, Queen, Billie Jean, Bohemian Rhapsody, SpongeBob, Naruto, Batman, Elsa, Lara Croft, Barış Manço, Ted Lasso, Wednesday, Spider-Man, MFÖ, Blinding Lights, Link, Homer Simpson.

### 6.4 Fotoğraf / asset politikası

| Kullan | Kullanma |
|---|---|
| Kendi illüstrasyon/ikon | Film/dizi karesi |
| Unsplash/Pexels/Pixabay (lisanslı) — nesne/hayvan/yemek/yer | Ünlü yüzü, karakter resmi |
| Emoji / SVG | Marka logosu, kulüp arması |
| Sizin ürettiğiniz AI asset (gerçek kişiye benzemez) | Google Image scrape |

Dağılım: günlük kategorilerde ~%50–70 güvenli görsel; soyut/IP → none.  
Mağaza: asset bundle; runtime random web image yok.  
Copy: *“Tahmin oyunu — resmi lisanslı ürün değildir.”*

### 6.5 +18 / Yetişkin masası

**Tanım:** Porn değil. Flört, utanç, içki/parti, ilişki halleri, hafif ima.  
**Yasak:** Explicit seks, genital, şiddet, nefret, body shaming, küfür spam, gerçek influencer sexualization, IP karakterleri seksüelleştirme.

| Konu | Karar |
|---|---|
| UI adı | **Yetişkin masası** (ateşli 🔥🔥 copy yok) |
| Default | Kapalı |
| Açılış | 18+ onay: *“Flört, parti ve utanç. Müstehcen içerik yok.”* |
| Pack | Ayrı `packs/adult/*.json` — child’a sızmaz |
| Görsel | Neredeyse hep none/emoji; sexy stock model yok |
| Store | Age rating uygun işaretle |
| Tone QA | `crude` etiketi yayına girmez; `witty|flirty|awkward` |

IP kategorileri default **PG**; +18’de IP karakter seksüelleştirilmez.

---

## 7. Sonuç ekranı

### Maç sonu

- Sıralı liderboard (kişi veya takım)
- Tap detay: kolay/orta/zor doğru adedi × puan = toplam
- Pas sayısı
- Kart listesi: `✓ metin  Zor +3` / `→ (pas) metin  Orta`
- Rozetler (abartısız): **Zor avcısı** (en çok hard doğru), opsiyonel **Temiz tur** (en az pas)

Mikrocopy didaktik/cringe olmasın (“Hep kolay mı?” yok).

---

## 8. UI / UX / tasarım sistemi

### 8.1 Kişilik

**Ol:** Akıllı masa gecesi, net, sıcak, yarışma.  
**Olma:** Çocuk odası, meme UI, casino, sex-app pembesi, mor-neon “AI party”, krem+terracotta serif klise, gazete grid, card forest.

Marka cümlesi: *Masada kal; uygulamaya bakma.* / *Akıllı parti — ucuz TikTok partisi değil.*

### 8.2 Yön adı: “Masa Gecesi”

| Token | Değer | Rol |
|---|---|---|
| `--bg` | `#12141A` | Ana zemin |
| `--bg-elev` | `#1C1F28` | Lobby yüzey |
| `--ink` | `#F4F0E8` | Ana yazı |
| `--muted` | `#9A958C` | İkincil |
| `--accent` | `#F0B429` | Marka / CTA / timer |
| `--correct` | `#3DDC97` | Doğru |
| `--pass` | `#FF6B4A` | Pas |
| `--easy` | `#7EB6FF` | Zorluk rozeti |
| `--medium` | `#F0B429` | |
| `--hard` | `#C4A0FF` | **Sadece rozet** — tema rengi değil |
| `--adult` | `#E8A0B8` | Yetişkin switch |

Arka plan: hafif amber radial + ince grain; gösterişli multi-stop neon gradient yok.

### 8.3 Tipografi

| Rol | Öneri | Kullanım |
|---|---|---|
| Display / marka | Bricolage Grotesque veya Syne ExtraBold | Home, logo |
| Kart kelimesi | Archivo Black veya Outfit 800 | Play: 48–72pt |
| UI body | Source Sans 3 | Ayarlar, TR glyph |
| Skor (ops.) | IBM Plex Mono | `+3` |

**Play (alın) — non-negotiable:**

- Landscape kilit
- Kelime ekranın ~%70’i
- Max 3 satır; uzun metinde küçült, min ~36pt
- Üst: ince timer + zorluk noktaları
- Alt: geniş **Doğru / Pas** (gyro yanında her zaman)
- Play’de marka/logo yok; sticker/dekor yok
- Kelime birincil; görsel varsa destek (IP’de görsel yok)

### 8.4 Ekran haritası

```
Home (marka hero + 2 CTA: Hızlı oyun | Özel oda)
→ Kurulum
→ “Alnına koy” 3-2-1
→ PLAY (landscape)
→ Tur özeti (liste + puan kırılımı)
→ Skor tahtası → Sonraki / Maç sonu
→ Özel kelime defteri (ayarlardan)
```

Home ilk viewport: marka + kısa vaat + CTA’lar. Stats/promo clutter yok.

### 8.5 Motion (bilinçli 2–3)

1. 3-2-1 scale  
2. Doğru: yeşil flash + `+N` + haptic (zor’da belirgin)  
3. Maç sonu sıralama stagger — confetti yağmuru yok  

### 8.6 Bileşenler

- Lobby: tek sütun liste + chip (dashboard card grid yok)
- CTA: dolu amber, radius ~12–16 (pill cluster yok)
- Kategori chip + accent stroke
- Yetişkin: net label, emoji spam yok

### 8.7 Erişilebilirlik

- Play’de yüksek kontrast
- Doğru/pas sadece renkle değil (ikon+yazı)
- Gyro kapalıyken tam oynanır
- Dynamic Type lobby; play’de XL kart kontrolü

### 8.8 Referanslardan alınan / alınmayan

| Al | Alma |
|---|---|
| Heads Up alın UX + eğ | Lisanslı IP görseller, video zorunluluğu (video = v2 optional) |
| Offline pass-and-play | Neon magenta/cyan maximalism |
| Display vs body font ayrımı | Mor–purple AI gradient teması |

---

## 9. Monetizasyon (önceki konuşma; v1 esnek)

```
Free:  temel desteler + tur arası reklam (partiyi bozmayacak sıklık)
Premium: tüm desteler + reklamsız + custom sınırsız (~₺49–79/ay veya lifetime bandı tartışılır)
IAP:  tematik paket (düğün/yurt) ileride
```

İçerik hukuken temiz kalacak (MEB soru dump’ı / illegal download yok — bu proje zaten kelime/parti).

**Not:** Kurucunun mevcut kelime oyunuyla ASO çakışması riski var. Ben Kimim = **parti / sosyal** positioning; “kelime bulmaca” gibi satma.

---

## 10. Teknik kapsam (v1)

| Dahil | Hariç (v1) |
|---|---|
| Expo RN (TypeScript) | Backend / auth / cloud save |
| Lokal JSON/asset pack | N-device realtime sync |
| Gyro + buton | Resmi lisanslı karakter artı |
| Offline-first | Video kayıt (Heads Up feature) — v2 |
| Seed’li deck motoru | AI canlı kart üretimi (gerekmez) |
| Soft seed/QR ayar paylaşımı (opsiyonel) | Ranked online leaderboard |

İleride oda kodu istenirse: cloud değil, `settings+seed+customWords` encode (QR / deep link).

---

## 11. v1 MVP checklist

### Ürün

- [ ] Solo sıra + Takım
- [ ] Süre 45/60/90
- [ ] Kategori multi-select + en az 1–2 preset (“Klasik parti”, “Genel kültür”, “Eğlence dünyası”)
- [ ] Zorluk temposu 3 preset
- [ ] Yetişkin masası (kapalı default + onay + ayrı pack — pack boş bile olsa altyapı)
- [ ] Puan 1/2/3 + sonuç kırılımı
- [ ] Özel kelime listesi
- [ ] Gyro opsiyonel, buton zorunlu

### İçerik

- [ ] Core kategorilerden güçlü bir subset (≥8) ship
- [ ] Eğlence dünyası (IP) subset ship — hepsi `visual: none`
- [ ] Her kartta `difficulty` zorunlu
- [ ] Güvenli görseller sadece non-IP’de
- [ ] Cringe / telif QA pass

### UI

- [ ] Masa Gecesi token’ları
- [ ] Font çiftleri yüklü
- [ ] Play landscape + dev tipografi
- [ ] Home marka-öncelikli
- [ ] Maç sonu skor + zorluk tablosu

### Kalite

- [ ] `npm`/typecheck yeşil
- [ ] Gyro kapalı smoke test
- [ ] 6 oyunculu takım smoke test
- [ ] Adult kapalıyken adult kart sızıntısı yok

---

## 12. Açık / sonraki adımlar (henüz yapılmadı)

1. Proje scaffold (Expo) — `benkimim` veya benzeri klasör
2. Agent kit bootstrap (kurucunun `~/Desktop/cursor-agent-kit/` var)
3. `DESIGN.md` repo’ya kilitle
4. `MatchSettings` + state machine implementasyonu
5. İlk JSON pack’ler (core + IP + adult iskelet)
6. Ekranlar: Home / Lobby / Play / Results
7. (Opsiyonel) her kategori için ilk 25’lik yayın aday listeleri
8. Store age rating + gizlilik / “lisanslı değil” metni

---

## 13. Bilinçli olarak reddedilenler

- Online multiplayer backend
- Ünlü/karakter **fotoğraflı** kartlar
- Aşırı neon-mor / meme / çocuksu UI
- Pas’a ağır default ceza
- Saf uniform random deck (kontrollü pack şart)
- +18 = porno / küfür çöplüğü
- Kelime oyunuyla aynı “solo puzzle” rafa girmek
- v1’de P2P çok telefon sync

---

## 14. Yeni agent için başlangıç komutu (öneri)

```
Ben Kimim için greenfield Expo RN (TypeScript) parti oyunu kur.
Kaynak: bu HANDOFF dosyasındaki TÜM kararlar locked kabul et.
İlk sprint:
1) Proje scaffold + tema token’ları (Masa Gecesi)
2) Card/MatchSettings tipleri + deck motoru (seed, difficulty pack, 1/2/3 skor)
3) Solo + Takım lobby + Play landscape + Results
4) Örnek JSON: 2–3 core kategori + 1 IP kategori (visual none) + adult iskelet kapalı
Backend yok. Online yok. Telifli görsel yok.
Bitince typecheck + 6 kişilik manuel smoke senaryosu yaz.
```

---

## 15. İlişkili proje context (yan bilgi)

Kurucunun diğer işleri (karıştırma):

- **Afterlight** — film editor
- **TaksitDefter** — taksit/hane finans, store submit
- **OtoTakvim** — `~/Desktop/ototakvim` araç bakımı takvim
- **Türkçe kelime oyunu** — mevcut; Ben Kimim’i onun kopyası gibi konumlandırma

Agent kit: `~/Desktop/cursor-agent-kit/scripts/bootstrap-new-project.sh`

---

*Bu rapor, Ben Kimim özelinde yapılan ürün tartışmalarının eksiksiz handoff’udur. Çelişen yeni istek yoksa buradaki locked kararlara uy.*
