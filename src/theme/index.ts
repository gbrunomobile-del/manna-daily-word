import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, AccessibilityInfo } from 'react-native';
import { ColorTokens, darkColors, lightColors } from './colors';
import { typography, fonts } from './typography';
import { spacing, radius, elevation, gutter, grain, HIT_SLOP, MIN_TOUCH } from './layout';
import { duration, easing, spring, TRAVEL } from './motion';

export type Scheme = 'light' | 'dark';

export type Theme = {
  scheme: Scheme;
  colors: ColorTokens;
  type: typeof typography;
  fonts: typeof fonts;
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  gutter: number;
  grain: typeof grain;
  motion: {
    duration: typeof duration;
    easing: typeof easing;
    spring: typeof spring;
    travel: number;
  };
  reduceMotion: boolean;
};

const buildTheme = (scheme: Scheme, reduceMotion: boolean): Theme => ({
  scheme,
  colors: scheme === 'dark' ? darkColors : lightColors,
  type: typography,
  fonts,
  spacing,
  radius,
  elevation,
  gutter,
  grain,
  motion: { duration, easing, spring, travel: TRAVEL },
  reduceMotion,
});

const ThemeContext = createContext<Theme>(buildTheme('light', false));

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { if (alive) setReduceMotion(v); })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { alive = false; sub.remove(); };
  }, []);

  const value = useMemo(
    () => buildTheme(system === 'dark' ? 'dark' : 'light', reduceMotion),
    [system, reduceMotion],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = (): Theme => useContext(ThemeContext);

export { HIT_SLOP, MIN_TOUCH };
export type { ColorTokens };
export * from './palette';
