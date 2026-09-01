import { palette, ramp } from './palette';

/**
 * Semantic tokens. Components consume these — never raw palette values.
 * Every token exists in both schemes so a colour can never be defined
 * in only one theme.
 */
export type ColorTokens = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceRaised: string;
  surfacePressed: string;

  /** Default body colour. Alias of textPrimary, kept so screens can read `text`. */
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  border: string;
  borderStrong: string;

  primary: string;
  primaryPressed: string;
  onPrimary: string;

  /**
   * A deliberately dark surface used inside otherwise light screens — the
   * question, the teaching moment, Reveal. Not the dark colour scheme; a
   * change of environment for a moment that wants focus.
   */
  immersive: string;
  immersiveRaised: string;
  onImmersive: string;
  onImmersiveMuted: string;

  /** Gold. Revelation, discovery, meaningful completion. Used sparingly. */
  accent: string;
  accentSoft: string;
  onAccent: string;

  /** Scripture body colour — distinct token so Scripture can be tuned alone. */
  scripture: string;
  /** Illumination behind emphasised Scripture. */
  illumination: string;

  success: string;
  successSoft: string;
  warning: string;
  error: string;
  errorSoft: string;

  brand: string;
  memory: string;
  water: string;

  overlay: string;
  scrim: string;
};

export const lightColors: ColorTokens = {
  background: palette.ivory,
  backgroundAlt: ramp.ivory50,
  surface: ramp.ivory50,
  surfaceRaised: '#FFFFFF',
  surfacePressed: ramp.ivory200,

  text: palette.ink,
  textPrimary: palette.ink,
  textSecondary: ramp.ink400,
  textMuted: ramp.sage,
  textInverse: palette.ivory,

  border: ramp.ivory300,
  borderStrong: ramp.ivory400,

  primary: palette.forest,
  primaryPressed: ramp.forestDeep,
  onPrimary: palette.goldSoft,

  immersive: ramp.night850,
  immersiveRaised: ramp.night700,
  onImmersive: '#F5EFE3',
  onImmersiveMuted: 'rgba(245,239,227,0.62)',

  accent: palette.gold,
  accentSoft: palette.morning,
  onAccent: palette.ink,

  scripture: palette.ink,
  illumination: palette.morning,

  success: palette.livingGreen,
  successSoft: '#E3EDE8',
  warning: ramp.goldDeep,
  error: ramp.clay,
  errorSoft: ramp.clayTint,

  brand: palette.livingGreen,
  memory: palette.fig,
  water: palette.livingWater,

  overlay: 'rgba(24,32,28,0.44)',
  scrim: 'rgba(24,32,28,0.08)',
};

export const darkColors: ColorTokens = {
  background: ramp.night800,
  backgroundAlt: ramp.night900,
  surface: ramp.night700,
  surfaceRaised: ramp.night600,
  surfacePressed: ramp.ink700,

  text: '#EEE9DD',
  textPrimary: '#EEE9DD',
  textSecondary: ramp.sageDark,
  textMuted: ramp.sageDeep,
  textInverse: palette.ink,

  border: ramp.ink600,
  borderStrong: ramp.ink500,

  primary: '#EEE9DD',
  primaryPressed: '#D9D3C6',
  onPrimary: ramp.night800,

  // Already dark, so the immersive surface only needs to sit a shade deeper
  // than the page rather than invert it.
  immersive: ramp.night900,
  immersiveRaised: ramp.night700,
  onImmersive: '#F5EFE3',
  onImmersiveMuted: 'rgba(245,239,227,0.62)',

  accent: ramp.goldDark,
  accentSoft: '#5A4A28',
  onAccent: ramp.night900,

  scripture: '#EEE9DD',
  illumination: '#4A3D22',

  success: '#5E9B82',
  successSoft: '#1B2A24',
  warning: palette.gold,
  error: ramp.clayDark,
  errorSoft: '#2E1F1E',

  brand: '#5E9B82',
  memory: '#A87F8C',
  water: palette.livingWater,

  overlay: 'rgba(8,11,9,0.62)',
  scrim: 'rgba(0,0,0,0.24)',
};
