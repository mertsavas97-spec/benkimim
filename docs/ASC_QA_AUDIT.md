# ASC 1.0 Pre-Submit QA Audit

**Date:** 2026-07-15  
**Scope:** App Store Connect 1.0 binary readiness (code + repo)  
**IAP stack:** **expo-iap** one-time non-consumable (`com.benkimim.app.premium_lifetime`) — **RevenueCat NOT required**

---

## Verdict

| Lane | Status |
|------|--------|
| Engineering QA Gate | **PASS** (typecheck / lint / `smoke:engine`) |
| Code launch blockers | **PASS** (no ASC-blocking placeholders left in ship paths) |
| Splash asset + `app.json` | **PASS** |
| Store / owner steps | **OPEN** (see checklist) |
| Ship claim | **Ready for ASC after owner steps** (not “binary already live”) |

---

## 1. Red-risk / placeholder scan

### Blockers (would fail ASC or cheat freemium) — fixed / clear

| Item | Status |
|------|--------|
| Custom cards forcing premium `categoryId` into deck | **FIXED** — `createMatch` always uses `categoryId: 'custom'` |
| Locked packs leaking via draft into match | **FIXED** — `filterPlayableCategories` at `beginMatch` |
| Production ad stub unlock (`EXPO_PUBLIC_ALLOW_AD_STUB=1`) | **OK** — `eas.json` preview/production set `"0"`; stub only when `__DEV__` or env `1` |
| Google sample AdMob publisher in prod units | **OK** — prod IDs use `4628962707131944`; test IDs only under `__DEV__` |
| Silent rewarded unlock failure | **FIXED** — SetupWizard `unlockMsg` wired |
| IAP purchase without product prefetch | **FIXED** — `fetchProducts` before `requestPurchase` |
| Lorem / TODO / yakında / dummy screens in `src/` | **None found** |
| RevenueCat missing | **N/A** — not required; expo-iap ASC-ok for non-consumable |

### Medium (not ASC rejecters if owner steps done)

| Item | Note |
|------|------|
| Expo Go IAP/ads stubs | `__DEV__` only; production EAS has stub off |
| UI `placeholder=` on TextInputs | Form hints (Ayşe/Mert etc.) — fine |
| `source: 'stub'` in premium.ts | Dev convenience when native IAP unavailable |
| Device smoke (gyro, 6-player, sandbox buy) | Owner / device — see below |
| Full UI vs moodboard visual score | Separate visual gate; splash PASS; no new simulator screenshot this pass |

### Owner-only (cannot close in repo alone)

1. App Store Connect: IAP product **Active**
2. EAS production rebuild + upload
3. GitHub Pages already live (verified HTTP 200) — keep Enabled
4. Screenshots + age rating + **Contains Ads**
5. Sandbox: buy / restore / rewarded unlock / premium = no ads

---

## 2. Monetization / ads (production path)

| Check | Result |
|-------|--------|
| `eas.json` `EXPO_PUBLIC_ALLOW_AD_STUB` | `"0"` preview + production |
| `ALLOW_AD_STUB` | `__DEV__ \|\| env === '1'` — production stub unlock returns **false** |
| Ad unit selection | `__DEV__` → Google TestIds / test units; else prod units from env/`app.json` extra |
| Interstitial gate | Skipped when premium |
| Premium | expo-iap non-consumable; restore via `getAvailablePurchases` |
| RevenueCat | **Not required** |

Legal URLs (live):

- https://mertsavas97-spec.github.io/benkimim/privacy/
- https://mertsavas97-spec.github.io/benkimim/support/
- https://mertsavas97-spec.github.io/benkimim/terms/

---

## 3. Splash

| Check | Result |
|-------|--------|
| `assets/splash-icon.png` | Present (1024×1536 PNG) |
| Brand | Masa Gecesi `#12141A`, gold typography, “Ben Kimim?” + “Tek telefon. Aynı masa.” |
| `app.json` splash | `image: ./assets/splash-icon.png`, `resizeMode: contain`, `backgroundColor: #12141A` |

---

## 4. QA Gate (this pass)

```text
npm run typecheck   → PASS
npm run lint        → PASS
npm run smoke:engine → PASS (714 cards, freemium assertions ok)
```

---

## 5. Fixed this pass

1. **`filterPlayableCategories`** in `src/data/loadPacks.ts` — drops locked archive packs when not unlocked; `custom` stays playable.
2. **`App.beginMatch`** applies filter before `createMatch` (defense in depth with engine custom-card fix).
3. **`isCategoryLocked('custom')`** → not locked (consistency).
4. **Engine smoke** extended for custom-only / mixed custom / filter freemium cases.
5. **Production warn** for `EXPO_PUBLIC_ALLOW_TEST_ADS=1`.
6. Audit doc created (`docs/ASC_QA_AUDIT.md`).

*(Prior pass, already in tree: match.ts custom category force, SetupWizard unlockMsg, premium `fetchProducts`, splash asset.)*

---

## 6. Owner checklist (remaining)

- [ ] ASC IAP `com.benkimim.app.premium_lifetime` **Active**
- [ ] `eas build --profile production` + submit
- [ ] Confirm Pages stays on for privacy/support/terms
- [ ] Screenshots + metadata; mark **Contains Ads**
- [ ] Sandbox: purchase, restore, 1-ad category unlock, premium ads-off
- [ ] Confirm production binary logs no test-unit / stub warnings

---

## Ship claim

**Code:** ready for ASC submit **after** owner store/EAS steps.  
**Not claiming:** “already approved” or moodboard visual ≥70 without fresh simulator evidence beyond splash.
