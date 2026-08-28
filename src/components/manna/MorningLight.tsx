import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Path, Ellipse } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * Abstract morning light falling into an open vessel.
 * Drawn rather than photographed — no stock imagery, and it scales cleanly.
 */
export const MorningLight = ({ height = 260 }: { height?: number }) => {
  const t = useTheme();
  const light = useSharedValue(0);

  useEffect(() => {
    light.value = t.reduceMotion
      ? 1
      : withTiming(1, { duration: t.motion.duration.illuminate, easing: t.motion.easing.out });
  }, [light, t.reduceMotion, t.motion]);

  const shaft = useAnimatedStyle(() => ({ opacity: 0.2 + light.value * 0.8 }));

  const dark = t.scheme === 'dark';
  const skyTop = dark ? '#1B211C' : '#EFE2C6';
  const skyBottom = dark ? '#2A2519' : '#E4CFA4';
  const gold = t.colors.accent;

  return (
    <View style={[styles.wrap, { height, borderRadius: t.radius.cardLarge }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={skyTop} />
            <Stop offset="100%" stopColor={skyBottom} />
          </LinearGradient>
          <RadialGradient id="sun" cx="50%" cy="26%" r="42%">
            <Stop offset="0%" stopColor="#FFF6E2" stopOpacity={dark ? 0.5 : 0.95} />
            <Stop offset="100%" stopColor="#FFF6E2" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sky)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sun)" />
      </Svg>

      <Animated.View style={[StyleSheet.absoluteFill, shaft]}>
        <Svg width="100%" height="100%" viewBox="0 0 320 260" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.0} />
              <Stop offset="45%" stopColor="#FFF3D8" stopOpacity={dark ? 0.28 : 0.6} />
              <Stop offset="100%" stopColor="#FFF3D8" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d="M132 20 L188 20 L214 196 L106 196 Z" fill="url(#beam)" />
          <Ellipse cx={160} cy={200} rx={64} ry={16} fill="#FFF3D8" opacity={dark ? 0.16 : 0.4} />
          {/* the vessel */}
          <Path
            d="M104 178 C104 214, 130 232, 160 232 C190 232, 216 214, 216 178"
            stroke={gold} strokeWidth={2.6} fill="none" strokeLinecap="round"
          />
          <Path d="M104 178h112" stroke={gold} strokeWidth={2.6} strokeLinecap="round" opacity={0.6} />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', width: '100%' },
});
