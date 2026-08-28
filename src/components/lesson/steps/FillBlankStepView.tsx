import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import type { FillBlankStep } from '@/types';

type Props = { step: FillBlankStep; onAdvance: () => void };

export const FillBlankStepView = ({ step, onAdvance }: Props) => {
  const t = useTheme();
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === step.answer;
  const [before = '', after = ''] = step.template.split('___');

  return (
    <View style={styles.flex}>
      <View style={styles.body}>
        <Text variant="reference" tone="muted" uppercase>{step.prompt}</Text>

        <View style={styles.line}>
          <Text variant="scriptureLarge">{before}</Text>
          <View
            style={[
              styles.slot,
              {
                borderBottomColor: picked ? (correct ? t.colors.accent : t.colors.error) : t.colors.borderStrong,
              },
            ]}
          >
            <Text variant="scriptureLarge" tone={picked ? (correct ? 'accent' : 'error') : 'muted'}>
              {picked ?? '     '}
            </Text>
          </View>
          <Text variant="scriptureLarge">{after}</Text>
        </View>

        <View style={styles.options}>
          {step.options.map((o, i) => {
            const chosen = picked === o;
            const isRight = o === step.answer;
            const show = picked && (chosen || (correct && isRight));
            return (
              <Animated.View key={o} entering={t.reduceMotion ? undefined : FadeInDown.delay(i * 60).duration(500)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={o}
                  disabled={correct}
                  onPress={() => { feedback.select(); setPicked(o); if (o === step.answer) feedback.correct(); }}
                  style={[
                    styles.option,
                    {
                      borderRadius: t.radius.pill,
                      borderColor: show ? (isRight ? t.colors.accent : t.colors.error) : t.colors.border,
                      backgroundColor: show && isRight ? t.colors.accentSoft : t.colors.surface,
                      opacity: correct && !isRight ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text variant="body">{o}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {picked && !correct ? (
          <Animated.View entering={t.reduceMotion ? undefined : FadeIn.duration(300)}>
            <Text variant="body" tone="secondary" style={styles.hint}>
              Not that one. Read the line again — it is the sentence people quote most from John 6.
            </Text>
          </Animated.View>
        ) : null}

        {correct ? (
          <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.duration(600)}>
            <Text variant="h2" tone="accent" style={styles.hint}>{step.affirmation}</Text>
          </Animated.View>
        ) : null}
      </View>

      {correct ? <Button label="Continue" onPress={onAdvance} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between', gap: 18 },
  body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  line: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 22 },
  slot: { borderBottomWidth: 1.5, paddingHorizontal: 8, marginHorizontal: 3 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 44 },
  option: {
    paddingHorizontal: 20, minHeight: MIN_TOUCH, justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  hint: { marginTop: 26 },
});
