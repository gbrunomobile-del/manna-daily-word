import { Easing } from 'react-native-reanimated';

/** Motion means REVELATION. Dark to light. Uncovered, not merely appearing. */
export const duration = {
  micro: 150,
  quick: 220,
  base: 350,
  slow: 480,
  reveal: 900,
  illuminate: 1400,
} as const;

/** Nothing overshoots. Everything decelerates into place. */
export const easing = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  entrance: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

export const spring = {
  gentle: { damping: 22, stiffness: 180, mass: 1 },
  settle: { damping: 30, stiffness: 240, mass: 1 },
} as const;

/** Reveals travel a short distance over a long duration — that reads as weight. */
export const TRAVEL = 14;
