# 1.0 Launch Checklist

Kod tarafı v1 hazırlıkları bu repoda. Mağaza / hesap adımları senin.

## Kod (bu turda)

- [x] Core loop (setup → play → skor)
- [x] Solo + takım, süre, tempo, genel paket + rewarded unlock
- [x] Özel kartlar, ayarlar (gyro/haptics/XL/pas), onboarding
- [x] WHO-only 714 kart + hint audit
- [x] +18 kaldırıldı
- [x] Premium (tek seferlik) + interstitial gate + Expo Go güvenli stub
- [x] ErrorBoundary, Legal/Privacy metinleri, `eas.json`, store alanları (`ITSAppUsesNonExemptEncryption`, motion string)
- [x] Home → Kimlik paketleri

## Senin yapılacaklar (blocker)

1. **Gizlilik URL** — `docs/legal/PRIVACY.md` içeriğini HTTPS’e koy; iletişimi doldur  
   → `EXPO_PUBLIC_PRIVACY_POLICY_URL` + App Store / Play
2. **AdMob** — gerçek App ID (`app.json` plugin) + interstitial/rewarded unit  
   → `EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID` / `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID`
3. **IAP** — `com.benkimim.app.premium_lifetime` her iki mağazada Active  
   → `docs/MONETIZATION_SETUP.md`
4. **EAS** — `eas init` (projectId), development + production build  
   → `eas build --profile production`
5. **Mağaza** — ekran görüntüleri, age rating (~12+), “reklam içerir”, telif uyarısı  
   → `docs/legal/STORE.md`
6. **Sandbox** — Premium al / geri yükle / 1 reklamla kategori aç / Premium’da reklam yok

## Smoke (cihaz / sim)

- [ ] Gyro kapalı: sadece kaydır/buton
- [ ] 6 oyuncu takım turu
- [ ] Hemen oyna → maç sonu
- [ ] Rewarded unlock kalıcı
- [ ] Production build’te test AdMob ID kalmadığını doğrula

## Ship claim notu

Product checklist hazır; moodboard visual score ≥70 ayrı (screenshot QA). Store binary için yukarıdaki **Senin yapılacaklar** şart.
