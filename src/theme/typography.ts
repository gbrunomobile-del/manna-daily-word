import { TextStyle } from 'react-native';

export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
} as const;

export type TypeVariant =
  | 'display' | 'hero' | 'h1' | 'h2' | 'h3'
  | 'bodyLarge' | 'body' | 'bodySmall'
  | 'label' | 'caption'
  | 'scriptureLarge' | 'scripture' | 'reference';

/**
 * SERIF = Word / Story / Reflection.  SANS = Action / Navigation / Learning.
 * Line heights are absolute so Scripture keeps its rhythm at any scale.
 */
export const typography: Record<TypeVariant, TextStyle> = {
  display:    { fontFamily: fonts.serif, fontSize: 46, lineHeight: 50, letterSpacing: -0.4 },
  hero:       { fontFamily: fonts.serif, fontSize: 36, lineHeight: 41, letterSpacing: -0.3 },
  h1:         { fontFamily: fonts.serif, fontSize: 29, lineHeight: 35, letterSpacing: -0.2 },
  h2:         { fontFamily: fonts.serif, fontSize: 23, lineHeight: 29 },
  h3:         { fontFamily: fonts.sansSemi, fontSize: 17, lineHeight: 23, letterSpacing: -0.1 },

  bodyLarge:  { fontFamily: fonts.sans, fontSize: 17, lineHeight: 27 },
  body:       { fontFamily: fonts.sans, fontSize: 15.5, lineHeight: 24 },
  bodySmall:  { fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 20 },

  label:      { fontFamily: fonts.sansSemi, fontSize: 12, lineHeight: 15, letterSpacing: 1.1 },
  caption:    { fontFamily: fonts.sans, fontSize: 11.5, lineHeight: 16 },

  scriptureLarge: { fontFamily: fonts.serif, fontSize: 31, lineHeight: 44, letterSpacing: -0.2 },
  scripture:      { fontFamily: fonts.serif, fontSize: 23, lineHeight: 34 },
  reference:      { fontFamily: fonts.sansMedium, fontSize: 11.5, lineHeight: 15, letterSpacing: 1.7 },
};
