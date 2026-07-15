# Content Policy — WHO only (locked 2026-07-14)

## Ürün gerçeği

**Ben Kimim** = alında **kim** olduğunu tahmin et.  
Kart metni bir **kimlik** olmalı (şahıs, karakter, bilinen kişi rolü).

## Yasak (kelime / nesne arşivi)

Bunlar **ship edilemez** (kelime oyunu raftıyla çakışır + ürün vaadine aykırı):

- Yemek, eşya, yer adı, duygu, eylem, spor branşı adı, bilim kavramı, marka türü, şarkı adı, ofis jargonu, soyut kelimeler
- Örnek yasak: Menemen, Futbol, Mutluluk, Asansör, Billie Jean (şarkı)

## İzinli (kimlik)

| Tip | Örnek |
|-----|--------|
| Yerli/yabancı dizi karakteri | Behzat Ç., Walter White |
| Film / oyun / süper kahraman karakteri | Shrek, Geralt of Rivia, Batman |
| ~~Çizgi / anime~~ | **Ship dışı** (2026-07) — `cizgi_anime` deprecated |
| Müzisyen / sanatçı (kişi) | Sezen Aksu, Tarkan |
| Ünlü / sporcu / tarihî kişi | … |
| Meslek **kimliği** | ~~Ship dışı~~ (2026-07 kaldırıldı) — rol değil kişi |
| Adult | flört/utanç **kimlik veya tip** — durum cümlesi değil (rewrite gerekir) |

## Custom words

Kullanıcı özel listesi de **kim** olmalı; UI microcopy: “İsim / karakter ekle”, “kelime” deme.

## Motor assert

`loadPacks` yalnızca WHO pack yükler. Object pack dosyaları arşivde kalsa bile **wire edilmez**; silme/yeniden yazma Content sprint’te.
