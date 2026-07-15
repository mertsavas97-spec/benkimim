# Monetization — senin tarafında yapılacaklar

Uygulama kodu hazır: **tek seferlik Premium (ömür boyu)**, **banner**, **rewarded ile kategori açma**, **sayfa arası interstitial**. Expo Go’da native SDK yok → stub / no-op.

> Gerçek reklam / satın alma için **Expo Go yetmez** — EAS Development Build veya production build gerekir.

---

## 1) Google AdMob — mevcut IDs

Publisher: `4628962707131944`

| Tür | Unit / App ID |
|-----|----------------|
| **App ID** (iOS + Android, aynı) | `ca-app-pub-4628962707131944~9097764961` |
| **Banner** | `ca-app-pub-4628962707131944/3039743218` |
| **Interstitial** (Geçiş) | `ca-app-pub-4628962707131944/9176253648` |
| **Rewarded** (Tüm Kategoriler) | `ca-app-pub-4628962707131944/3311205951` |

`app.json` plugin:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-4628962707131944~9097764961",
    "iosAppId": "ca-app-pub-4628962707131944~9097764961"
  }
]
```

Unit ID override (opsiyonel, EAS Secrets / `.env` — bkz. `.env.example`):

| Env | Varsayılan |
|-----|------------|
| `EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID` | Banner birimi |
| `EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID` | Interstitial |
| `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID` | Rewarded |
| `EXPO_PUBLIC_ALLOW_AD_STUB` | Production’da **`0`** / koyma |

`__DEV__` → Google test unit ID; release → production unit’ler.

### Hâlâ manuel

1. AdMob’da uygulama / birimler **Active** mi kontrol et.
2. **App ID değişti** → `npx eas build` ile **yeniden native build** (plugin native’e gömülür).
3. Store listelerinde “Reklam içerir” beyanı.
4. Privacy Policy’de reklam + IAP maddesi.
5. GDPR/UMP (AB) istersen ayrı consent SDK (v1’de yok).

---

## 2) Tek seferlik Premium (IAP)

Ürün ID (kod varsayılanı): `com.benkimim.app.premium_lifetime`  
Değiştirmek için: `EXPO_PUBLIC_IAP_PREMIUM_ID` veya `app.json` → `extra.iapPremiumProductId` ile aynı ID’yi her yerde kullan.

### Apple App Store Connect

1. Uygulama kaydı: bundle `com.benkimim.app`.
2. **In-App Purchase** → **Non-Consumable** (tek seferlik, abonelik değil).
3. Product ID: `com.benkimim.app.premium_lifetime` (veya seçtiğin ID).
4. Fiyat, Türkçe lokalizasyon: örn. “Ömür boyu Premium — tüm kategoriler, reklamsız”.
5. Paid Apps Agreement / banka / vergi bilgileri tamam.
6. Sandbox test kullanıcısı oluştur → gerçek cihazda Development Build ile dene.
7. “Restore purchases” App Review için zorunlu — uygulamada **Satın almayı geri yükle** var.

### Google Play Console

1. Uygulama: paket `com.benkimim.app`.
2. Monetize → In-app products → **One-time product** (managed / non-consumable).
3. Product ID aynı: `com.benkimim.app.premium_lifetime`.
4. License testers ekle; internal testing track’te dene.
5. Play Billing Library `expo-iap` ile gelir — store listing’de “Uygulama içi satın alma”.

---

## 3) EAS / native build

```bash
npx eas-cli login
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

- Expo Go’da native AdMob/IAP **yok** → stub veya sessiz no-op.
- Plugin + App ID değişince **mutlaka yeniden native build**.

`eas.json` yoksa: `eas build:configure` ile oluştur.

---

## 4) Davranış (ürün)

| Durum | Kategoriler | Banner | Interstitial | Rewarded unlock |
|-------|-------------|--------|--------------|-----------------|
| Free | Genel paket | Home / Packs / Settings | Menü geçişleri + maç bitince eve dönüş (90 sn cooldown) | Masa kurarken 1 reklam → tüm kategoriler |
| Packs unlocked (reklam) | Hepsi | Var | Var | — |
| Premium (IAP) | Hepsi | Yok | Yok | — |

Play / ready / next_player içinde reklam **yok** (parti bozulmasın).

---

## 5) Yayın öncesi checklist

- [x] AdMob App ID + 3 unit ID kodda
- [ ] IAP ürün her iki mağazada Active / Ready
- [ ] Sandbox’ta satın al + geri yükle geçti
- [ ] Rewarded izleyince kategoriler kalıcı açılıyor (AsyncStorage)
- [ ] Premium sonrası banner / interstitial / rewarded yok
- [ ] Privacy Policy’de reklam + satın alma maddesi
- [ ] EAS rebuild (App ID plugin sonrası)
- [ ] `EXPO_PUBLIC_ALLOW_AD_STUB` production’da kapalı

---

## 6) Kod referansı

| Dosya | Rol |
|-------|-----|
| `src/monetization/config.ts` | Unit ID + premium product |
| `src/monetization/ads.ts` | Banner helpers + rewarded + interstitial |
| `src/components/AdBanner.tsx` | Anchored adaptive banner UI |
| `src/monetization/premium.ts` | Tek seferlik IAP |
| `src/monetization/gate.ts` | Premium kapısı + cooldown |
| `src/storage/entitlements.ts` | `packsUnlocked` / `premium` persist |
| `.env.example` | Env şablonu |
| `docs/MONETIZATION_SETUP.md` | Bu checklist |
