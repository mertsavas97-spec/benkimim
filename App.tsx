import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import { loadAllCards } from './src/data/loadPacks';
import {
  advanceTurn,
  createMatch,
  endMatch,
  endRound,
  startReady,
  startRound,
  submitCorrect,
  submitPass,
  type Match,
} from './src/engine';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { enterPlayLandscape, unlockPortrait } from './src/lib/orientation';
import { CustomWordsScreen } from './src/screens/CustomWordsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { HowToPlayScreen } from './src/screens/HowToPlayScreen';
import { LegalScreen } from './src/screens/LegalScreen';
import { NextPlayerScreen } from './src/screens/NextPlayerScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PacksScreen } from './src/screens/PacksScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { ReadyScreen } from './src/screens/ReadyScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SetupWizard, type SetupStep } from './src/screens/SetupWizard';
import {
  defaultSetup,
  draftToSettings,
  matchPlayerSeeds,
  type SetupDraft,
} from './src/setup/draft';
import { bootMonetization, maybeShowInterstitial, setPremiumAdGate } from './src/monetization/gate';
import {
  DEFAULT_PREFS,
  loadOnboardingDone,
  loadPrefs,
  resetOnboarding,
  saveOnboardingDone,
  savePrefs,
  type AppPrefs,
} from './src/storage/appPrefs';
import {
  loadCustomWords,
  saveCustomWords,
  type CustomWord,
} from './src/storage/customWords';
import {
  loadPacksUnlocked,
  loadPremiumUnlocked,
} from './src/storage/entitlements';
import { colors } from './src/theme/tokens';

type Route =
  | { name: 'boot' }
  | { name: 'onboarding' }
  | { name: 'home' }
  | { name: 'howto' }
  | { name: 'setup'; step: SetupStep }
  | { name: 'packs' }
  | { name: 'settings' }
  | { name: 'custom_words'; from: 'home' | 'setup' }
  | { name: 'legal' }
  | { name: 'next_player' }
  | { name: 'ready' }
  | { name: 'play' }
  | { name: 'round_end' }
  | { name: 'match_end' };

const SETUP_ORDER: SetupStep[] = ['players', 'settings', 'categories'];


export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_800ExtraBold,
    ArchivoBlack_400Regular,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  const archive = useMemo(() => loadAllCards(), []);
  const [route, setRoute] = useState<Route>({ name: 'boot' });
  const [prefs, setPrefs] = useState<AppPrefs>(DEFAULT_PREFS);
  const [packsUnlocked, setPacksUnlocked] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [draft, setDraft] = useState<SetupDraft>(() => defaultSetup(false));
  const [match, setMatch] = useState<Match | null>(null);
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);

  useEffect(() => {
    void (async () => {
      const [done, unlocked, premium, p, words] = await Promise.all([
        loadOnboardingDone(),
        loadPacksUnlocked(),
        loadPremiumUnlocked(),
        loadPrefs(),
        loadCustomWords(),
      ]);
      setPrefs(p);
      setIsPremium(premium);
      setPacksUnlocked(unlocked || premium);
      setCustomWords(words);
      setDraft(defaultSetup(false, p));
      await bootMonetization(premium);
      setRoute(done ? { name: 'home' } : { name: 'onboarding' });
    })();
  }, []);

  useEffect(() => {
    if (route.name === 'play') return;
    if (route.name === 'ready' || route.name === 'next_player' || route.name === 'boot') return;
    void unlockPortrait();
  }, [route.name]);

  const guesserName = useMemo(() => {
    if (!match) return '';
    const g = match.players[match.turnIndex % match.players.length];
    return g?.name ?? '';
  }, [match]);

  const beginMatch = useCallback(
    (d: SetupDraft) => {
      const merged: SetupDraft = {
        ...d,
        gyroEnabled: prefs.gyroEnabled,
        tiltInverted: prefs.tiltInverted,
        cardTextScale: prefs.cardTextScale,
        passPenalty: prefs.passPenalty,
      };
      const m = startReady(
        createMatch(
          archive,
          { ...draftToSettings(merged), customWords },
          matchPlayerSeeds(merged),
        ),
      );
      setMatch(m);
      setRoute({ name: 'next_player' });
    },
    [archive, customWords, prefs],
  );

  const openSetup = (
    mode: SetupDraft['mode'],
    opts: { quick?: boolean } = {},
  ) => {
    const quick = !!opts.quick;
    setDraft({ ...defaultSetup(quick, prefs), mode });
    setRoute({ name: 'setup', step: quick ? 'categories' : 'players' });
  };

  const goHome = (withAd = true) => {
    void unlockPortrait();
    setMatch(null);
    setRoute({ name: 'home' });
    if (withAd) void maybeShowInterstitial({ force: true });
  };

  const navigateMenu = (next: Route) => {
    setRoute(next);
    // Ayarlar / legal: reklam yok (premium satın alma yolunu bozma)
    if (next.name === 'howto' || next.name === 'custom_words' || next.name === 'packs') {
      void maybeShowInterstitial();
    }
  };

  const onPremiumChange = (on: boolean) => {
    setIsPremium(on);
    if (on) {
      setPacksUnlocked(true);
      setPremiumAdGate(true);
    }
  };

  const stepBack = () => {
    if (route.name !== 'setup') return;
    if (draft.quick && route.step === 'categories') {
      setRoute({ name: 'home' });
      return;
    }
    const i = SETUP_ORDER.indexOf(route.step);
    if (i <= 0) {
      setRoute({ name: 'home' });
      return;
    }
    setRoute({ name: 'setup', step: SETUP_ORDER[i - 1] });
  };

  const stepNext = () => {
    if (route.name !== 'setup') return;
    const i = SETUP_ORDER.indexOf(route.step);
    const next = SETUP_ORDER[Math.min(i + 1, SETUP_ORDER.length - 1)];
    setRoute({ name: 'setup', step: next });
  };

  const onReadyDone = useCallback(() => {
    void enterPlayLandscape().then(() => {
      setMatch((m) => (m ? startRound(m) : m));
      setRoute({ name: 'play' });
    });
  }, []);

  const persistPrefs = (next: AppPrefs) => {
    setPrefs(next);
    void savePrefs(next);
  };

  if (!fontsLoaded || route.name === 'boot') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
      <View style={styles.root}>
        <StatusBar
          barStyle="light-content"
          hidden={route.name === 'play'}
        />

        {route.name === 'onboarding' ? (
          <OnboardingScreen
            onDone={() => {
              void saveOnboardingDone();
              setRoute({ name: 'home' });
            }}
          />
        ) : null}

        {route.name === 'home' ? (
          <HomeScreen
            isPremium={isPremium}
            onQuickPlay={() => openSetup('solo_turn', { quick: true })}
            onStartMode={(mode) => openSetup(mode)}
            onHowTo={() => navigateMenu({ name: 'howto' })}
            onPacks={() => navigateMenu({ name: 'packs' })}
            onEditCards={() => navigateMenu({ name: 'custom_words', from: 'home' })}
            onSettings={() => navigateMenu({ name: 'settings' })}
          />
        ) : null}

        {route.name === 'howto' ? (
          <HowToPlayScreen
            onBack={() => goHome(false)}
            onPlay={() => openSetup('solo_turn', { quick: true })}
          />
        ) : null}

        {route.name === 'legal' ? <LegalScreen onBack={() => goHome(false)} /> : null}

        {route.name === 'packs' ? (
          <PacksScreen
            packsUnlocked={packsUnlocked}
            isPremium={isPremium}
            onBack={() => goHome(false)}
          />
        ) : null}

        {route.name === 'settings' ? (
          <SettingsScreen
            prefs={prefs}
            packsUnlocked={packsUnlocked}
            isPremium={isPremium}
            onChange={persistPrefs}
            onPremiumChange={onPremiumChange}
            onBack={() => goHome(false)}
            onReplayOnboarding={() => {
              void resetOnboarding();
              setRoute({ name: 'onboarding' });
            }}
            onAbout={() => navigateMenu({ name: 'legal' })}
          />
        ) : null}

        {route.name === 'setup' ? (
          <SetupWizard
            draft={draft}
            step={route.step}
            packsUnlocked={packsUnlocked}
            onUnlocked={() => setPacksUnlocked(true)}
            onChange={setDraft}
            onBack={stepBack}
            onNext={stepNext}
            onStart={() => beginMatch(draft)}
          />
        ) : null}

        {route.name === 'custom_words' ? (
          <CustomWordsScreen
            initial={customWords}
            onBack={() =>
              setRoute(
                route.from === 'setup'
                  ? { name: 'setup', step: 'categories' }
                  : { name: 'home' },
              )
            }
            onSave={(words) => {
              setCustomWords(words);
              void saveCustomWords(words);
              setRoute(
                route.from === 'setup'
                  ? { name: 'setup', step: 'categories' }
                  : { name: 'home' },
              );
            }}
          />
        ) : null}

        {route.name === 'next_player' && match ? (
          <NextPlayerScreen match={match} onContinue={() => setRoute({ name: 'ready' })} />
        ) : null}

        {route.name === 'ready' && match ? (
          <ReadyScreen guesserName={guesserName} onDone={onReadyDone} />
        ) : null}

        {route.name === 'play' && match ? (
          <PlayScreen
            match={match}
            hapticsEnabled={prefs.hapticsEnabled}
            keepAwake={prefs.keepAwake}
            tiltEnabled={prefs.gyroEnabled}
            onCorrect={() => setMatch((m) => (m ? submitCorrect(m) : m))}
            onPass={() => setMatch((m) => (m ? submitPass(m) : m))}
            onTimeUp={() => {
              void unlockPortrait();
              setMatch((m) => (m ? endRound(m) : m));
              setRoute({ name: 'round_end' });
            }}
          />
        ) : null}

        {route.name === 'round_end' && match ? (
          <ResultsScreen
            match={match}
            variant="round"
            onHome={goHome}
            onNext={() => {
              if (!match) return;
              const next = advanceTurn(match);
              setMatch(next);
              if (next.phase === 'match_end') {
                setRoute({ name: 'match_end' });
              } else {
                setRoute({ name: 'next_player' });
              }
            }}
            onEndMatch={() => {
              setMatch((m) => (m ? endMatch(m) : m));
              setRoute({ name: 'match_end' });
            }}
          />
        ) : null}

        {route.name === 'match_end' && match ? (
          <ResultsScreen
            match={match}
            variant="match"
            onNext={() => {}}
            onHome={goHome}
            onRematch={() => beginMatch(draft)}
          />
        ) : null}
      </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
