import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme/tokens';
import { fonts } from '../theme/typography';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Kök hata sarmalayıcı — Play/engine throw’da beyaz ekran yerine kurtarma.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary', error, info.componentStack);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Bir şey takıldı</Text>
          <Text style={styles.body}>
            Masayı bozmayalım — uygulamayı yenile, kaldığın yerden devam et.
          </Text>
          {__DEV__ ? (
            <Text style={styles.dev} numberOfLines={6}>
              {this.state.error.message}
            </Text>
          ) : null}
          <Pressable
            style={styles.btn}
            onPress={() => this.setState({ error: null })}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>Tekrar dene</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: space.lg,
    gap: space.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    lineHeight: 22,
  },
  dev: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.pass,
    marginTop: space.sm,
  },
  btn: {
    marginTop: space.md,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.bg,
  },
});
