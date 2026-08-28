import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  tone?: 'neutral' | 'accent' | 'brand' | 'onDark';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Pill = ({ label, tone = 'neutral', icon, style }: Props) => {
  const t = useTheme();
  const map = {
    neutral: { bg: t.colors.surfacePressed, border: 'transparent', text: 'secondary' as const },
    accent: { bg: t.colors.accentSoft, border: 'transparent', text: 'primary' as const },
    brand: { bg: t.colors.successSoft, border: 'transparent', text: 'brand' as const },
    onDark: { bg: 'rgba(238,233,221,0.10)', border: 'rgba(238,233,221,0.18)', text: 'inverse' as const },
  };
  const p = map[tone];
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: p.bg, borderColor: p.border, borderRadius: t.radius.pill, gap: t.spacing.xxs },
        style,
      ]}
    >
      {icon}
      <Text variant="caption" tone={p.text} uppercase style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 7, borderWidth: StyleSheet.hairlineWidth * 2,
  },
  text: { letterSpacing: 1.2, fontSize: 10.5 },
});
