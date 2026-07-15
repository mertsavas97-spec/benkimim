import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

type Opts = {
  enabled: boolean;
  inverted: boolean;
  onCorrect: () => void;
  onPass: () => void;
  cooldownMs?: number;
};

/**
 * Alın modu: telefon landscape alında.
 * Default: ileri eğ = doğru, geri eğ = pas.
 */
export function useTiltControls({
  enabled,
  inverted,
  onCorrect,
  onPass,
  cooldownMs = 900,
}: Opts) {
  const lastAt = useRef(0);
  const armed = useRef(true);
  const correctRef = useRef(onCorrect);
  const passRef = useRef(onPass);

  useEffect(() => {
    correctRef.current = onCorrect;
    passRef.current = onPass;
  }, [onCorrect, onPass]);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ y, z }) => {
      const tilt = z * 0.65 + y * 0.35;
      const threshold = 0.55;
      if (Math.abs(tilt) < threshold * 0.35) {
        armed.current = true;
        return;
      }

      const now = Date.now();
      if (now - lastAt.current < cooldownMs) return;
      if (!armed.current) return;

      if (tilt > threshold) {
        lastAt.current = now;
        armed.current = false;
        if (inverted) passRef.current();
        else correctRef.current();
      } else if (tilt < -threshold) {
        lastAt.current = now;
        armed.current = false;
        if (inverted) correctRef.current();
        else passRef.current();
      }
    });

    return () => sub.remove();
  }, [enabled, inverted, cooldownMs]);
}
