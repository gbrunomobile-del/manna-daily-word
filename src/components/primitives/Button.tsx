import React, { useCallback } from 'react';
import { Pressable, ActivityIndicator, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { useTheme, MIN_TOUCH } from '@/theme';

type Variant = 'primary' | 'secondary' | 'text' | 'onDark';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  label, onPress, variant = 'primary', disabled, loading, full = true, style, accessibilityHint,
}: Props) => {
  const t = useTheme();
  const press = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.014 }],
  }));

  const handle = useCallback(() => {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [disabled, loading, onPress]);

  const palette: Record<Variant, { bg: string; border: string; tone: 'onPrimary' | 'primary' | 'inverse' }> = {
    primary:   { bg: t.colors.primary, border: t.colors.primary, tone: 'onPrimary' },
    secondary: { bg: 'transparent', border: t.colors.borderStrong, tone: 'primary' },
    text:      { bg: 'transparent', border: 'transparent', tone: 'primary' },
    onDark:    { bg: 'transparent', border: 'rgba(238,233,221,0.34)', tone: 'inverse' },
  };
  const p = palette[variant];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPressIn={() => { press.value = withTiming(1, { duration: t.motion.duration.micro }); }}
      onPressOut={() => { press.value = withTiming(0, { duration: t.motion.duration.quick }); }}
      onPress={handle}
      style={[
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          borderRadius: t.radius.button,
          paddingHorizontal: t.spacing.xl,
          opacity: disabled ? 0.4 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        animated,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? t.colors.onPrimary : t.colors.textPrimary} />
      ) : (
        <View style={styles.row}>
          <Text variant="label" tone={p.tone} uppercase style={styles.label}>
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH - 12 },
  label: { letterSpacing: 1.4 },
});
