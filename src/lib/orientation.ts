import * as ScreenOrientation from 'expo-screen-orientation';
import { Dimensions } from 'react-native';

export async function lockPlayLandscape(): Promise<void> {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } catch {
    /* web / unsupported */
  }
}

export async function unlockPortrait(): Promise<void> {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  } catch {
    /* web / unsupported */
  }
}

/** Orientation settle — portrait insets/layout kaymasını önler */
export function waitForLandscape(timeoutMs = 1400): Promise<void> {
  return new Promise((resolve) => {
    const win = Dimensions.get('window');
    if (win.width > win.height) {
      resolve();
      return;
    }
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      if (window.width > window.height) {
        sub.remove();
        // bir frame layout için
        requestAnimationFrame(() => resolve());
      }
    });
    setTimeout(() => {
      sub.remove();
      resolve();
    }, timeoutMs);
  });
}

export async function enterPlayLandscape(): Promise<void> {
  await lockPlayLandscape();
  await waitForLandscape();
}
