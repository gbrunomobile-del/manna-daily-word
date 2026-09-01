import React, { useEffect } from 'react';
import { View, StyleSheet, Image, type ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence,
} from 'react-native-reanimated';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { useTheme } from '@/theme';

interface LampProps {
  lit: boolean;
  /** Staggers the flame so a row of lamps does not pulse in unison. */
  offset?: number;
  size?: number;
}

/**
 * A single oil lamp. Lit lamps carry a gold flame that breathes gently;
 * a spent lamp keeps its vessel but loses its light.
 *
 * Drawn rather than illustrated so it takes the theme's colours and stays
 * crisp at the small sizes the lesson header needs.
 */
const Lamp = ({ lit, offset = 0, size = 22 }: LampProps) => {
  const t = useTheme();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!lit) { breath.value = withTiming(0, { duration: 400 }); return; }
    // Staggered per lamp so a row does not pulse in unison, and quick enough
    // to read as a flame rather than a slow fade.
    const up = 780 + offset * 190;
    const down = 960 + offset * 150;
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: up }),
        withTiming(0, { duration: down }),
      ),
      -1,
      false,
    );
  }, [lit, offset, breath]);

  // A flame should rise and brighten, not swell evenly in both directions —
  // hence the upward shift alongside the vertical scale.
  const flame = useAnimatedStyle(() => ({
    opacity: lit ? 0.58 + breath.value * 0.42 : 0,
    transform: [
      { translateY: -breath.value * 1.6 },
      { scaleY: 0.93 + breath.value * 0.19 },
      { scaleX: 1.02 - breath.value * 0.04 },
    ],
  }));

  const vessel = lit ? t.colors.accent : t.colors.border;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* The vessel: a shallow bowl with a spout and a raised foot. */}
        <Path
          d="M4 15.4 C4 13.9 7 13.1 12 13.1 C17 13.1 20 13.9 20 15.4 C20 17.1 17 18.2 12 18.2 C7 18.2 4 17.1 4 15.4 Z"
          fill={vessel}
          opacity={lit ? 0.9 : 0.5}
        />
        <Path d="M2.2 15.1 L5 14.2 L5 16.4 Z" fill={vessel} opacity={lit ? 0.9 : 0.5} />
        <Ellipse cx="12" cy="19.6" rx="4.2" ry="1.1" fill={vessel} opacity={lit ? 0.55 : 0.3} />
      </Svg>

      {/* The flame, drawn over the vessel so it can breathe independently. */}
      <Animated.View style={[StyleSheet.absoluteFill, flame]} pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 4.2 C13.6 6.6 14.6 8.1 14.6 9.7 C14.6 11.5 13.4 12.7 12 12.7 C10.6 12.7 9.4 11.5 9.4 9.7 C9.4 8.1 10.4 6.6 12 4.2 Z"
            fill={t.colors.accent}
          />
          <Path
            d="M12 7.4 C12.8 8.9 13.2 9.6 13.2 10.3 C13.2 11.2 12.7 11.8 12 11.8 C11.3 11.8 10.8 11.2 10.8 10.3 C10.8 9.6 11.2 8.9 12 7.4 Z"
            fill={t.colors.accentSoft}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

interface Props {
  /** How many lamps remain lit. */
  remaining: number;
  total?: number;
  size?: number;
}

/**
 * LAMP INDICATOR
 *
 * Replaces the hearts. The underlying count is unchanged — this is only how it
 * is shown. A mistake dims a lamp rather than taking a life, so the language
 * and the feeling stay consistent with the rest of MANNA.
 */
export const LampIndicator = ({ remaining, total = 3, size = 22 }: Props) => (
  <View
    style={styles.row}
    accessibilityRole="text"
    accessibilityLabel={
      remaining === 1 ? 'One lamp remaining' : `${remaining} lamps remaining`
    }
  >
    {Array.from({ length: total }).map((_, i) => (
      <Lamp key={i} lit={i < remaining} offset={i} size={size} />
    ))}
  </View>
);

/**
 * ENGRAVED LAMP
 *
 * The Doré lamp, in two layers: a still vessel with the flame animated over
 * it. The two images were separated from a single engraving and share one
 * crop, so the flame sits on the wick when they are stacked.
 *
 * Used where the lamp is the subject and has room — the Gathered screen. The
 * drawn LampIndicator above stays for small utility indicators, where engraved
 * linework would be illegible.
 */
export const EngravedLamp = ({
  lamp, flame, size = 200,
}: {
  lamp: ImageSourcePropType;
  flame: ImageSourcePropType;
  size?: number;
}) => {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 1150 }),
      ),
      -1,
      false,
    );
  }, [breath]);

  // Gentler than the small indicator: at this size a strong pulse reads as
  // flickering rather than burning.
  const flameStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + breath.value * 0.28,
    transform: [
      { translateY: -breath.value * (size * 0.008) },
      { scaleY: 0.97 + breath.value * 0.07 },
      { scaleX: 1.01 - breath.value * 0.02 },
    ],
  }));

  return (
    <View style={[styles.engraved, { width: size, height: size }]}>
      <Image source={lamp} style={styles.engravedImage} resizeMode="contain" />
      <Animated.View style={[styles.engravedLayer, flameStyle]} pointerEvents="none">
        <Image source={flame} style={styles.engravedImage} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  engraved: { alignItems: 'center', justifyContent: 'center' },
  engravedLayer: { ...StyleSheet.absoluteFillObject },
  engravedImage: { width: '100%', height: '100%' },
});
