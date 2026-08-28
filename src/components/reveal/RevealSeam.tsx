import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Text } from '../primitives/Text';
import { ScriptureText } from '../scripture/ScriptureText';
import { ScriptureReference } from '../scripture/ScriptureReference';
import { useTheme } from '@/theme';
import type { ScripturePassage } from '@/types';

type Props = {
  left: ScripturePassage;
  right: ScripturePassage;
  leftLabel: string;
  rightLabel: string;
  play?: boolean;
};

/**
 * THE REVEAL SEAM.
 * Two passages set side by side, joined by a seam of light that opens
 * between them. Dark to light — the content stays the hero.
 */
export const RevealSeam = ({ left, right, leftLabel, rightLabel, play = true }: Props) => {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const seam = useSharedValue(0);
  const cols = useSharedValue(0);

  useEffect(() => {
    if (!play) return;
    if (t.reduceMotion) { seam.value = 1; cols.value = 1; return; }
    seam.value = withTiming(1, { duration: t.motion.duration.illuminate, easing: t.motion.easing.inOut });
    cols.value = withDelay(360, withTiming(1, { duration: t.motion.duration.reveal, easing: t.motion.easing.out }));
  }, [play, seam, cols, t.reduceMotion, t.motion]);

  const seamStyle = useAnimatedStyle(() => ({
    opacity: seam.value,
    transform: [{ scaleY: 0.15 + seam.value * 0.85 }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    opacity: cols.value,
    transform: [{ translateX: (1 - cols.value) * -10 }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: cols.value,
    transform: [{ translateX: (1 - cols.value) * 10 }],
  }));

  const narrow = width < 380;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.col, leftStyle]}>
        <Text variant="reference" tone="accent" uppercase>{leftLabel}</Text>
        <ScriptureReference refValue={left.ref} tone="muted" />
        <View style={{ height: t.spacing.md }} />
        <ScriptureText passage={left} size={narrow ? 'normal' : 'normal'} illuminate={false} />
      </Animated.View>

      <View style={styles.seamTrack}>
        <Animated.View style={[StyleSheet.absoluteFill, seamStyle]}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={t.colors.accent} stopOpacity={0} />
                <Stop offset="22%" stopColor={t.colors.accent} stopOpacity={0.9} />
                <Stop offset="78%" stopColor={t.colors.accent} stopOpacity={0.9} />
                <Stop offset="100%" stopColor={t.colors.accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#seam)" />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View style={[styles.col, rightStyle]}>
        <Text variant="reference" tone="accent" uppercase>{rightLabel}</Text>
        <ScriptureReference refValue={right.ref} tone="muted" />
        <View style={{ height: t.spacing.md }} />
        <ScriptureText passage={right} size="normal" illuminate={false} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'stretch' },
  col: { flex: 1 },
  seamTrack: { width: 1.5, marginHorizontal: 18, alignSelf: 'stretch', minHeight: 160 },
});
