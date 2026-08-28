import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bookmark, BookOpen, Sparkles, Link2 } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { ScriptureText } from '@/components/scripture/ScriptureText';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';
import { useTheme, MIN_TOUCH } from '@/theme';
import { useProgress } from '@/store/progress';
import { feedback } from '@/services/feedback';
import type { ScriptureStep, Lesson } from '@/types';

type Props = { step: ScriptureStep; lesson: Lesson; onAdvance: () => void };

export const ScriptureStepView = ({ step, lesson, onAdvance }: Props) => {
  const t = useTheme();
  const { savedPassageIds, toggleSaved } = useProgress();
  const passage = lesson.passages[step.passageId];
  if (!passage) return null;
  const saved = savedPassageIds.includes(passage.id);

  const actions = [
    { key: 'context', label: 'Context', Icon: BookOpen, onPress: onAdvance },
    { key: 'save', label: saved ? 'Saved' : 'Save', Icon: Bookmark, onPress: () => { feedback.select(); void toggleSaved(passage.id); } },
    { key: 'remember', label: 'Remember', Icon: Sparkles, onPress: () => feedback.select() },
    { key: 'connect', label: 'Connect', Icon: Link2, onPress: () => feedback.select() },
  ] as const;

  return (
    <View style={styles.flex}>
      <View style={styles.body}>
        <Animated.View entering={t.reduceMotion ? undefined : FadeIn.duration(500)}>
          <ScriptureReference refValue={passage.ref} tone="accent" />
        </Animated.View>

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(160).duration(900)}
          style={styles.scripture}
        >
          <ScriptureText passage={passage} size="large" showTranslation />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.actions, { borderTopColor: t.colors.border }]}>
          {actions.map(({ key, label, Icon, onPress }) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={onPress}
              style={styles.action}
            >
              <Icon
                size={19}
                strokeWidth={1.7}
                color={key === 'save' && saved ? t.colors.accent : t.colors.textMuted}
              />
              <Text variant="caption" tone={key === 'save' && saved ? 'accent' : 'muted'}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Button label="Continue" onPress={onAdvance} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between' },
  body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  scripture: { marginTop: 22 },
  footer: { gap: 20 },
  actions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16 },
  action: { flex: 1, alignItems: 'center', gap: 6, minHeight: MIN_TOUCH },
});
