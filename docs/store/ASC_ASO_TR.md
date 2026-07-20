# ASC ASO — Ben Kimim (TR)

**Locale:** App Store Connect → Turkish (`tr`) primary  
**Version:** 1.0.0  
**Bundle ID:** `com.benkimim.app`  
**Kaynak:** `PROJECT_BRIEF.md`, `docs/legal/ASC_URLS.md`, `docs/legal/STORE.md`, `docs/ASC_QA_AUDIT.md`  
**Skill:** `wording-copywriter` (Masa Gecesi tonu; mağaza metninde birincil pitch = arkadaş / parti / toplanma — “gece” sınırlı değil)

Karakter sayıları aşağıdaki kutularda **Unicode code point** (`len`) ile doğrulanmıştır.

---

## Hızlı özet (kopyala-yapıştır)

| Alan | Değer | Limit | Sayım |
|------|--------|-------|-------|
| App Name | `Ben Kimim?` | 30 | 10 |
| Subtitle | `Arkadaşlarla kafa oyunu` | 30 | 23 |
| Promotional Text | (aşağıda) | 170 | 145 |
| Keywords | (aşağıda) | 100 | 100 |
| Description | (aşağıda) | 4000 | 1694 |
| Support URL | https://mertsavas97-spec.github.io/benkimim/support/ | — | — |
| Privacy Policy URL | https://mertsavas97-spec.github.io/benkimim/privacy/ | — | — |
| Marketing URL | https://mertsavas97-spec.github.io/benkimim/ | opsiyonel | — |
| Terms | https://mertsavas97-spec.github.io/benkimim/terms/ | açıklamada + opsiyonel alan | — |
| Contains Ads | **Yes** | — | — |

**İsim notu:** `Ben Kimim?` veya `Ben Kimim` tercih. ASC’de alınmışsa alternatif: `Ben Kimim Parti` (15). Subtitle’da “ben kimim” tekrar etme.

---

## App Name (max 30)

```
Ben Kimim?
```

**Alternatifler (isim doluysa):**

```
Ben Kimim
```

```
Ben Kimim Parti
```

---

## Subtitle (max 30)

```
Arkadaşlarla kafa oyunu
```

**Alternatif:**

```
Parti tahmin · aynı oda
```

---

## Promotional Text (max 170) — isteğe bağlı, güncellenebilir

```
Arkadaş ortamında alın tahmini: telefon alnına, onlar anlatsın, sen bil. Solo sıra veya takım. Çevrimiçi oda yok — aynı mekânda, istediğin zaman.
```

---

## Keywords (max 100, virgülle, boşluksuz)

```
parti,tahmin,alınoyunu,arkadaş,takım,eğlence,sessizsinema,kafa,forehead,toplantı,ünlü,dizi,film,spor
```

**Kurallar (uygulandı):** marka adı yok · Apple/iPhone/iOS spam yok · rakip ticari marka yok · isim/subtitle kelimelerini mümkün olduğunca boşa harcama.

---

## Description (max 4000)

```
Ben Kimim?, arkadaşlarınla aynı odada oynadığın Türkçe parti tahmin oyunu.

Telefonu alnına koy — ekranı başkaları görür, sen görmezsin. Onlar ipucu verir veya canlandırır; sen doğru bildikçe skor birikir. Doğum günü, ev partisi, iş sonrası toplanma, yolculuk molası: tek cihaz yeterli, internet veya çevrimiçi oda gerekmez.

Nasıl oynanır
• Bir kişi telefonu alnına tutar (alın / kafa oyunu).
• Diğerleri anlatır veya gösterir.
• Doğru veya pas — eğerek veya butonla.
• Süre bitince sıra sonraki oyuncuya veya takıma geçer.

Modlar
• Solo sıra: herkes kendi turunda tahmin eder; skor kişiye yazılır.
• Takım: 2 veya daha fazla takım; skor takım havuzunda toplanır.

Kategoriler (kişi / karakter arşivi)
Ücretsiz Genel paket: Ünlüler, Film, Yerli dizi.
Daha fazla paket: yabancı dizi, oyun, süper kahraman, müzisyen, sporcular, tarihî kişiler.
İstersen kendi kartlarını da ekle.

Zorluk ve puan
Kartlar kolay / orta / zor. Ağırlıklı puanla tur ve maç skoru netleşir — sonuç ekranı veriyi gösterir, seni yargılamaz.

Masada kal; uygulamaya bakma.
Akıllı parti — ucuz TikTok partisi değil.

Premium (tek seferlik satın alma)
Ücretsiz sürümde reklam gösterilebilir; bazı kategoriler kısa bir reklamla bir kez açılabilir.
İstersen tek seferlik Premium ile tüm kategorileri açıp reklamsız oynarsın. Abonelik değil.

Tahmin oyunu — resmi lisanslı ürün değildir. Dizi, film, oyun ve müzisyen isimleri yalnızca bilinen kültürel referans olarak metin halinde kullanılır; telifli görseller içermez.

Destek
https://mertsavas97-spec.github.io/benkimim/support/

Gizlilik Politikası
https://mertsavas97-spec.github.io/benkimim/privacy/

Kullanım Koşulları
https://mertsavas97-spec.github.io/benkimim/terms/
```

---

## What's New (1.0.0)

```
İlk sürüm.

• Aynı odada alın tahmini — tek telefon, çevrimdışı parti
• Solo sıra ve takım modları
• Türkçe kişi/karakter kategorileri + kendi kartların
• Zorluk kırılımlı skor
• İsteğe bağlı tek seferlik Premium (tüm kategoriler, reklamsız)
```

---

## URL alanları (ASC)

| ASC alanı | URL |
|-----------|-----|
| **Support URL** | https://mertsavas97-spec.github.io/benkimim/support/ |
| **Privacy Policy URL** | https://mertsavas97-spec.github.io/benkimim/privacy/ |
| **Marketing URL** | https://mertsavas97-spec.github.io/benkimim/ |
| **Terms** (ayrı alan yoksa açıklamada) | https://mertsavas97-spec.github.io/benkimim/terms/ |

Kod kaynağı: `src/monetization/config.ts`, `app.json` → `extra.*Url`.

---

## ASC App Review Notes (EN — paste into Review Notes)

```
Ben Kimim is an offline, same-room Turkish party guessing game (forehead / “who am I” style) on a single device. No online multiplayer, no accounts, no user-generated chat.

How to demo:
1. Open app → start a match with 2+ players (or teams).
2. Guesser holds phone on forehead; others see the card and give clues.
3. Correct / pass via tilt and/or buttons; round ends on timer.

Monetization:
• Free tier may show Google AdMob ads (banner / interstitial / rewarded).
• Rewarded ad can unlock all archive categories once (non-premium path).
• IAP (non-consumable, one-time): com.benkimim.app.premium_lifetime
  → unlocks all categories + removes ads. Not a subscription. Restore Purchases supported.

Age / content:
• Entertainment party game only. No medical, gambling, or explicit sexual content.
• No +18 / adult pack in this product path.
• Suggested age rating band: 12+ (infrequent/mild mature themes via pop-culture names; Contains Ads).
• IP names are text-only cultural references; not licensed merchandise.

Contains Ads: Yes (declare in ASC even though Premium removes ads).
```

---

## Age rating & ads checklist

| Madde | Öneri |
|-------|--------|
| Age rating | **12+** bandı (reklam + popüler kültür isimleri; müstehcen yok) |
| +18 / Yetişkin masası | **Bu ürün yolunda yok** — age questionnaire’da sexual content / unrestricted web yok |
| **Contains Ads** | **Yes** (freemium; Premium reklamsız hale getirir ama beyan hâlâ Yes) |
| Gambling / contests | No |
| Medical claims | Yok — yalnızca eğlence |

---

## Optional EN locale (kısa not)

Tam EN metadata zorunlu değil. Dual locale kullanırsan:

- **Name:** `Who Am I?` riskli / jenerik — tercih: `Ben Kimim?` aynı bırak veya `Ben Kimim Party`
- **Subtitle (≤30):** `Forehead party guessing`
- **Keywords:** EN ayrı locale’de ayrı alan; TR keywords’ü EN’e kopyalama

---

## Karakter doğrulama (bu dosya yazılırken)

| Alan | Sayım | Limit | Durum |
|------|-------|-------|-------|
| App Name `Ben Kimim?` | 10 | 30 | OK |
| Subtitle | 23 | 30 | OK |
| Promotional Text | 145 | 170 | OK |
| Keywords | 100 | 100 | OK |
| Description | 1694 | 4000 | OK |

---

## Sprint Agent Raporu

| | |
|--|--|
| **Task** | ASC ASO TR store copy + URL placements |
| **Skills** | `wording-copywriter` |
| **Product score** | 88 — brief + legal URL + freemium/IAP dürüst; “gece-only” yok; verbatim telif + marka cümleleri |
| **Visual score** | N/A — metin teslimi, UI/screenshot yok |
| **Ship claim** | Store **metadata ready to paste**; binary/EAS claim değil |
| **QA** | Karakter limitleri script ile doğrulandı; engineering typecheck/lint bu task’ta gerekmedi |
