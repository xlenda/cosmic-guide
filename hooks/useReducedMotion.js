import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

function readWebPreference() {
  if (
    Platform.OS !== 'web'
    || typeof window === 'undefined'
    || typeof window.matchMedia !== 'function'
  ) {
    return null;
  }

  try {
    return !!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return null;
  }
}

// A preferência começa como `null` no nativo. Consumidores que disparam
// movimento automaticamente devem tratar esse intervalo como movimento
// reduzido: assim ninguém recebe um primeiro frame espacial antes de a
// consulta assíncrona ao sistema terminar.
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(readWebPreference);

  useEffect(() => {
    let active = true;

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        setReducedMotion(false);
        return undefined;
      }

      let mediaQuery;
      try {
        mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      } catch {
        setReducedMotion(false);
        return undefined;
      }

      const update = (event) => {
        if (active) setReducedMotion(!!event.matches);
      };

      setReducedMotion(!!mediaQuery.matches);
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', update);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(update);
      }

      return () => {
        active = false;
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', update);
        } else if (typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(update);
        }
      };
    }

    let subscription;
    try {
      if (typeof AccessibilityInfo.isReduceMotionEnabled === 'function') {
        AccessibilityInfo.isReduceMotionEnabled()
          .then((enabled) => {
            if (active) setReducedMotion(!!enabled);
          })
          .catch(() => {
            if (active) setReducedMotion(false);
          });
      } else {
        setReducedMotion(false);
      }

      if (typeof AccessibilityInfo.addEventListener === 'function') {
        subscription = AccessibilityInfo.addEventListener(
          'reduceMotionChanged',
          (enabled) => {
            if (active) setReducedMotion(!!enabled);
          },
        );
      }
    } catch {
      setReducedMotion(false);
    }

    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  return reducedMotion;
}

export default useReducedMotion;
