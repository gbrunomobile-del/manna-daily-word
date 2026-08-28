import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

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
      {body}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ flex: { flex: 1 } });
