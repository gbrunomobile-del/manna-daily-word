import React, { useCallback } from 'react';
import { Pressable, ActivityIndicator, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
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
  /** A gold arrow at the trailing edge — for actions that carry you onward. */
  arrow?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  label, onPress, variant = 'primary', disabled, loading, full = true, arrow,
  style, accessibilityHint,
}: Props) => {
  const t = useTheme();
  const press = useSharedValue(0);

  const palette: Record<Variant, {
    bg: string; bgPressed: string; border: string;
    tone: 'onPrimary' | 'primary' | 'inverse';
  }> = {
    primary:   { bg: t.colors.primary, bgPressed: t.colors.primaryPressed, border: t.colors.primary, tone: 'onPrimary' },
    secondary: { bg: 'transparent', bgPressed: t.colors.surfacePressed, border: t.colors.borderStrong, tone: 'primary' },
    text:      { bg: 'transparent', bgPressed: 'transparent', border: 'transparent', tone: 'primary' },
    onDark:    { bg: 'transparent', bgPressed: 'rgba(238,233,221,0.08)', border: 'rgba(238,233,221,0.34)', tone: 'inverse' },
  };
  const p = palette[variant];

  // A small settle rather than a bounce, and the ground darkens with it — the
  // press should feel like pressing paper, not a game button.
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.012 }, { translateY: press.value * 1.5 }],
    backgroundColor: interpolateColor(press.value, [0, 1], [p.bg, p.bgPressed]),
  }));

  const handle = useCallback(() => {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [disabled, loading, onPress]);

  const labelColour =
    variant === 'primary' ? t.colors.onPrimary
    : variant === 'onDark' ? t.colors.onImmersive
    : t.colors.textPrimary;

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
        <ActivityIndicator color={labelColour} />
      ) : (
        <View style={styles.row}>
          <Text variant="label" tone={p.tone} uppercase style={styles.label}>
            {label}
          </Text>
          {arrow && (
            <ArrowRight
              size={17}
              color={labelColour}
              strokeWidth={2}
              style={styles.arrow}
            />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH - 12 },
  label: { letterSpacing: 1.4 },
  arrow: { marginLeft: 10 },
});