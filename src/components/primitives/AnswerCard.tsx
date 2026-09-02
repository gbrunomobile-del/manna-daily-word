import React, { useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, withSequence, interpolateColor,
} from 'react-native-reanimated';
import { Text } from './Text';
import { useTheme, MIN_TOUCH } from '@/theme';

export type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface Props {
  label: string;
  state?: AnswerState;
  /** A, B, C, D. Omitted for true/false, where a letter adds nothing. */
  marker?: string;
  onPress?: () => void;
  /** Set on the dark question surface, where the palette inverts. */
  onDark?: boolean;
}

/**
 * ANSWER CARD
 *
 * Correct is illuminated rather than approved: gold outline and a warm ground,
 * not a green tick. Incorrect is muted rather than alarming — the card recedes
 * instead of flashing. Nothing here should feel like a form field.
 */
export const AnswerCard = ({
  label, state = 'default', marker, onPress, onDark = false,
}: Props) => {
  const t = useTheme();
  const press = useSharedValue(0);
  const settled = useSharedValue(0);

  const locked = state === 'correct' || state === 'incorrect' || state === 'disabled';

  /**
   * A brief outward illumination when an answer proves right: the gold rises,
   * overshoots a little, then settles. Understanding arriving rather than a
   * box being ticked — and it stops short of anything that could be called
   * a celebration.
   */
  const glow = useSharedValue(0);

  useEffect(() => {
    settled.value = withTiming(
      state === 'correct' || state === 'incorrect' ? 1 : 0,
      { duration: 260 },
    );
    if (state === 'correct') {
      glow.value = withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(0.45, { duration: 420 }),
      );
    } else {
      glow.value = withTiming(0, { duration: 200 });
    }
  }, [state, settled, glow]);

  const ground = onDark ? t.colors.immersiveRaised : t.colors.surface;
  const groundPressed = onDark ? 'rgba(245,239,227,0.10)' : t.colors.surfacePressed;

  const resting =
    state === 'selected' ? (onDark ? 'rgba(212,162,61,0.16)' : t.colors.illumination)
    : ground;

  const target =
    state === 'correct' ? (onDark ? 'rgba(212,162,61,0.20)' : t.colors.illumination)
    : state === 'incorrect' ? (onDark ? 'rgba(114,80,91,0.22)' : t.colors.errorSoft)
    : resting;

  const border =
    state === 'correct' ? t.colors.accent
    : state === 'incorrect' ? t.colors.memory
    : state === 'selected' ? t.colors.accent
    : onDark ? 'rgba(245,239,227,0.18)' : t.colors.border;

  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      Math.max(press.value * (locked ? 0 : 1), settled.value),
      [0, 1],
      [resting, settled.value > 0 ? target : groundPressed],
    ),
    transform: [{ scale: 1 - press.value * (locked ? 0 : 0.008) + glow.value * 0.006 }],
  }));

  /** The marker swells with the illumination and stays a touch larger. */
  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glow.value * 0.16 }],
  }));

  const textColour = onDark ? t.colors.onImmersive : t.colors.textPrimary;

  return (
    <Animated.View style={animated}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={marker ? `${marker}. ${label}` : label}
        accessibilityState={{ disabled: locked, selected: state === 'selected' }}
        disabled={locked}
        onPressIn={() => { press.value = withTiming(1, { duration: 90 }); }}
        onPressOut={() => { press.value = withTiming(0, { duration: 160 }); }}
        onPress={onPress}
        style={[
          styles.card,
          {
            borderColor: border,
            borderWidth: state === 'correct' || state === 'selected' ? 1.5 : 1,
            opacity: state === 'disabled' ? 0.45 : 1,
          },
        ]}
      >
        {marker && (
          <Animated.View
            style={[
              styles.marker,
              markerStyle,
              {
                borderColor: state === 'correct' ? t.colors.accent : 'transparent',
                backgroundColor: state === 'correct' ? t.colors.accent : 'transparent',
              },
            ]}
          >
            <Text
              variant="h3"
              style={{
                color: state === 'correct' ? t.colors.onAccent : textColour,
                opacity: state === 'correct' ? 1 : 0.42,
              }}
            >
              {marker}
            </Text>
          </Animated.View>
        )}

        <Text variant="bodyLarge" style={[styles.label, { color: textColour }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    // Larger radius and generous padding: a page element rather than a form
    // field. The tighter box read as an input.
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 19,
    minHeight: MIN_TOUCH + 14,
  },
  /** A serif letter, unboxed until it turns out to be the right answer. */
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, lineHeight: 25 },
});
