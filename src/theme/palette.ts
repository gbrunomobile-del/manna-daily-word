/**
 * MANNA brand palette — the seven canonical colours.
 * Never reference these directly in components; use semantic tokens instead.
 */
export const palette = {
  ivory: '#F8F4EA',
  ink: '#18201C',
  livingGreen: '#356653',
  gold: '#D7AD5A',
  morning: '#F2DDAF',
  livingWater: '#92BFC1',
  fig: '#72505B',
} as const;

/** Tints and shades derived from the canonical seven. */
export const ramp = {
  ivory50: '#FCFAF4',
  ivory100: '#F8F4EA',
  ivory200: '#F1EADC',
  ivory300: '#E4DCC9',
  ivory400: '#CFC3A8',

  ink900: '#0E140F',
  ink800: '#18201C',
  ink700: '#232D26',
  ink600: '#2A342D',
  ink500: '#3C4841',
  ink400: '#4A544D',

  night900: '#0C100D',
  night800: '#111612',
  night700: '#171E19',
  night600: '#1D2620',

  goldDark: '#C8A75E',
  goldDeep: '#A88434',

  sage: '#8A9089',
  sageDark: '#A8B0A6',
  sageDeep: '#77807A',

  clay: '#A85A55',
  clayTint: '#F3E2DF',
  clayDark: '#D08C86',
} as const;
