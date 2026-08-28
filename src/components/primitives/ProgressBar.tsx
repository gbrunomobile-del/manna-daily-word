import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';

type Props = { value: number; total: number; onDark?: boolean };

export const ProgressBar = ({ value, total, onDark }: Props) => {
  const t = useTheme();
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const w = useSharedValue(pct);

  useEffect(() => {
    w.value = t.reduceMotion
      ? pct
      : withTiming(pct, { duration: t.motion.duration.base, easing: t.motion.easing.out });
  }, [pct, t.reduceMotion, t.motion, w]);

  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: value }}
      style={[
        styles.track,
        { backgroundColor: onDark ? 'rgba(238,233,221,0.16)' : t.colors.surfacePressed },
      ]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: t.colors.accent }, fill]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 3, borderRadius: 999, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: 999 },
});
