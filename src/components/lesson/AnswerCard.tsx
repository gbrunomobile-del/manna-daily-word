import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, withDelay, interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, X } from 'lucide-react-native';
import { Text } from '../primitives/Text';
import { useTheme, MIN_TOUCH } from '@/theme';

export type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';

type Props = {
  label: string;
  state: AnswerState;
  onPress: () => void;
  index: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The gold edge travels around a chosen card — the recurring MANNA signal
 * that something has been received rather than merely tapped.
 */
export const AnswerCard = ({ label, state, onPress, index }: Props) => {
  const t = useTheme();
  const press = useSharedValue(0);
  const lit = useSharedValue(0);
  const enter = useSharedValue(0);

  const active = state === 'selected' || state === 'correct' || state === 'incorrect';

  useEffect(() => {
    enter.value = t.reduceMotion
      ? 1
      : withDelay(
          index * 55,
          withTiming(1, { duration: t.motion.duration.slow, easing: t.motion.easing.out }),
        );
  }, [enter, index, t.reduceMotion, t.motion]);

  useEffect(() => {
    lit.value = withTiming(active ? 1 : 0, {
      duration: t.reduceMotion ? 0 : t.motion.duration.base,
      easing: t.motion.easing.out,
    });
  }, [active, lit, t.reduceMotion, t.motion]);

  const edge =
    state === 'correct' ? t.colors.success
    : state === 'incorrect' ? t.colors.error
    : t.colors.accent;

  const fill =
    state === 'correct' ? t.colors.successSoft
    : state === 'incorrect' ? t.colors.errorSoft
    : t.colors.accentSoft;

  const animated = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * t.motion.travel },
      { scale: 1 - press.value * 0.012 },
    ],
    borderColor: interpolateColor(lit.value, [0, 1], [t.colors.border, edge]),
    backgroundColor: interpolateColor(lit.value, [0, 1], [t.colors.surface, fill]),
  }));

  const disabled = state === 'disabled';

  return (
    <AnimatedPressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPressIn={() => { press.value = withTiming(1, { duration: t.motion.duration.micro }); }}
      onPressOut={() => { press.value = withTiming(0, { duration: t.motion.duration.quick }); }}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.card,
        {
          borderRadius: t.radius.card,
          paddingHorizontal: t.spacing.lg,
          opacity: disabled ? 0.45 : 1,
        },
        animated,
      ]}
    >
      <Text variant="bodyLarge" style={styles.label}>{label}</Text>
      <View style={styles.badge}>
        {state === 'correct' ? <Check size={19} color={t.colors.success} strokeWidth={2} /> : null}
        {state === 'incorrect' ? <X size={19} color={t.colors.error} strokeWidth={2} /> : null}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: MIN_TOUCH + 18,
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: { flex: 1, paddingRight: 12 },
  badge: { width: 22, alignItems: 'flex-end' },
});
