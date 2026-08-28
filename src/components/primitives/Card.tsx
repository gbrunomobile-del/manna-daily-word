import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  children: React.ReactNode;
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export const Card = ({ children, raised, style, padded = true }: Props) => {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: raised ? t.colors.surfaceRaised : t.colors.surface,
          borderColor: t.colors.border,
          borderRadius: t.radius.card,
          borderWidth: StyleSheet.hairlineWidth * 2,
          padding: padded ? t.spacing.xl : 0,
        },
        raised ? t.elevation.card : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};
