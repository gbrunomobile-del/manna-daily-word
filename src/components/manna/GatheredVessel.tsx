import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withDelay, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { useTheme } from '@/theme';

type Props = { size?: number; play?: boolean };

const GRAINS = [
  { x: -34, delay: 0, drift: 6 },
  { x: -14, delay: 180, drift: -4 },
  { x: 6, delay: 90, drift: 5 },
  { x: 26, delay: 260, drift: -6 },
  { x: 40, delay: 340, drift: 3 },
  { x: -24, delay: 430, drift: -3 },
];

/**
 * THE GATHERED VESSEL.
 * Light falls, gathers, and settles. The completion moment — calm, not confetti.
 */
export const GatheredVessel = ({ size = 200, play = true }: Props) => {
  const t = useTheme();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!play) return;
    glow.value = t.reduceMotion
      ? 1
      : withDelay(500, withTiming(1, { duration: t.motion.duration.illuminate, easing: t.motion.easing.out }));
  }, [play, glow, t.reduceMotion, t.motion]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.25 + glow.value * 0.75 }));

  return (
    <View style={{ width: size, height: size * 1.15, alignItems: 'center', justifyContent: 'flex-end' }}>
      {!t.reduceMotion && play && GRAINS.map((g, i) => (
        <Grain key={i} {...g} accent={t.colors.accent} height={size * 0.72} />
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 230">
          <Defs>
            <RadialGradient id="pool" cx="50%" cy="72%" r="46%">
              <Stop offset="0%" stopColor={t.colors.accent} stopOpacity={0.55} />
              <Stop offset="100%" stopColor={t.colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={100} cy={166} rx={86} ry={54} fill="url(#pool)" />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size * 0.62} viewBox="0 0 200 124" fill="none">
        <Path
          d="M20 30 C20 88, 56 112, 100 112 C144 112, 180 88, 180 30"
          stroke={t.colors.accent}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Path d="M20 30h160" stroke={t.colors.accent} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      </Svg>
    </View>
  );
};

const Grain = ({
  x, delay, drift, accent, height,
}: { x: number; delay: number; drift: number; accent: string; height: number }) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.bezier(0.4, 0, 0.5, 1) }),
        withTiming(1, { duration: 1 }),
      ),
    );
  }, [delay, p]);

  const style = useAnimatedStyle(() => ({
    opacity: p.value < 0.08 ? p.value / 0.08 : p.value > 0.86 ? (1 - p.value) / 0.14 : 1,
    transform: [
      { translateX: x + drift * p.value },
      { translateY: -height + p.value * height },
      { scale: 0.6 + (1 - p.value) * 0.5 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute', bottom: height * 0.42, width: 5, height: 5,
          borderRadius: 3, backgroundColor: accent,
        },
        style,
      ]}
    />
  );
};
