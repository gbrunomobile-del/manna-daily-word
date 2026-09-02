import React from 'react';
import { View, ScrollView, StyleSheet, Image, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

/**
 * PAPER GRAIN
 *
 * A tiled fibre overlay for light editorial surfaces. Deliberately absent from
 * the immersive Forest and Ink screens: pale fibre on near-black lightens
 * rather than adds tooth, and reads as digital noise instead of paper. Those
 * screens are meant to feel like a step out of paper and into illumination.
 *
 * Strength lives in the theme, not here — see `grain` in theme/layout.
 *
 * Applied once per screen. Cards and surfaces inherit the screen's grain
 * rather than stacking a second layer, which would double the strength
 * exactly where the eye already has the most to read.
 */
export const PaperGrain = () => {
  const t = useTheme();

  // Dark scheme is already an ink surface; grain belongs on paper.
  if (t.scheme === 'dark') return null;

  return (
    <Image
      source={require('../../../assets/paper-grain.png')}
      resizeMode="repeat"
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { opacity: t.grain.opacity, width: undefined, height: undefined },
      ]}
    />
  );
};

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  /** Paints the full-bleed background — used by Splash and Gathered. */
  dark?: boolean;
  edges?: readonly Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  gutter?: boolean;
};

export const Screen = ({
  children, scroll, dark, edges = ['top', 'bottom'], contentStyle, gutter = true,
}: Props) => {
  const t = useTheme();
  const bg = dark ? t.colors.textPrimary === '#EEE9DD' ? t.colors.background : '#111612' : t.colors.background;
  const padding = gutter ? { paddingHorizontal: t.gutter } : null;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padding, { paddingBottom: t.spacing.huge }, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padding, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: bg }]} edges={edges}>
      <StatusBar style={dark || t.scheme === 'dark' ? 'light' : 'dark'} />
      {/* Only on paper — never behind a dark full-bleed screen. */}
      {!dark && <PaperGrain />}
      {body}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ flex: { flex: 1 } });
