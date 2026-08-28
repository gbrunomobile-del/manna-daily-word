/** 4px base. Whitespace is part of the brand. */
export const spacing = {
  xxs: 4, xs: 8, sm: 12, md: 16, lg: 20,
  xl: 24, xxl: 32, xxxl: 40, huge: 48, vast: 64, colossal: 80,
} as const;

/** Primary mobile horizontal margin. */
export const gutter = 22;

export const radius = {
  sm: 10,
  button: 18,
  card: 22,
  cardLarge: 26,
  pill: 999,
} as const;

/** Restrained. Elevation is suggested by border and tone, not heavy shadow. */
export const elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  card: {
    shadowColor: '#18201C',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#18201C',
    shadowOpacity: 0.09,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
} as const;

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const MIN_TOUCH = 44;
