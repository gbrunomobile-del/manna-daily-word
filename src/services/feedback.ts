import * as Haptics from 'expo-haptics';

/** Haptics are subtle and few. Sound is optional and off by default. */
export const feedback = {
  select: () => Haptics.selectionAsync().catch(() => undefined),
  correct: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  gentle: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  reveal: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined),
  gathered: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
};
