import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/theme';
import type { TypeVariant } from '@/theme/typography';

export type TextTone =
  | 'primary' | 'secondary' | 'muted' | 'inverse'
  | 'accent' | 'brand' | 'error' | 'onPrimary';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
  style?: StyleProp<TextStyle>;
};

export const Text = ({
  variant = 'body',
  tone = 'primary',
  align,
  uppercase,
  style,
  children,
  ...rest
}: TextProps) => {
  const t = useTheme();
  const toneMap: Record<TextTone, string> = {
    primary: t.colors.textPrimary,
    secondary: t.colors.textSecondary,
    muted: t.colors.textMuted,
    inverse: t.colors.textInverse,
    accent: t.colors.accent,
    brand: t.colors.brand,
    error: t.colors.error,
    onPrimary: t.colors.onPrimary,
  };

  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.6}
      style={[
        t.type[variant],
        { color: toneMap[tone] },
        align ? { textAlign: align } : null,
        uppercase ? { textTransform: 'uppercase' as const } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
