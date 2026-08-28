import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { AnswerCard, AnswerState } from '../AnswerCard';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { track } from '@/services/analytics';
import type { ChoiceStep } from '@/types';

type Props = { step: ChoiceStep; lessonId: string; onAdvance: () => void };

export const ChoiceStepView = ({ step, lessonId, onAdvance }: Props) => {
  const t = useTheme();
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const chosenChoice = step.choices.find((c) => c.id === chosen);
  const settled = !!chosenChoice?.correct;

  const stateFor = (id: string): AnswerState => {
    if (settled) return step.choices.find((c) => c.id === id)?.correct ? 'correct' : 'disabled';
    if (wrongIds.includes(id)) return 'incorrect';
    if (chosen === id) return 'selected';
    return 'default';
  };

  const select = (id: string) => {
    const choice = step.choices.find((c) => c.id === id);
    if (!choice) return;
    setChosen(id);
    if (choice.correct) {
      feedback.correct();
      track({ name: 'answer_correct', lessonId, stepId: step.id });
    } else {
      setWrongIds((w) => (w.includes(id) ? w : [...w, id]));
      track({ name: 'answer_incorrect', lessonId, stepId: step.id });
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {step.quote ? (
          <View style={[styles.quote, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.card }]}>
            <Text variant="scripture">{step.quote}</Text>
            {step.quoteRefLabel ? (
              <Text variant="reference" tone="muted" uppercase style={styles.quoteRef}>{step.quoteRefLabel}</Text>
            ) : null}
          </View>
        ) : null}

        <Text variant="h1" style={styles.prompt}>{step.prompt}</Text>

        <View style={styles.choices}>
          {step.choices.map((c, i) => (
            <AnswerCard
              key={c.id}
              index={i}
              label={c.text}
              state={stateFor(c.id)}
              onPress={() => { if (!settled) select(c.id); }}
            />
          ))}
        </View>

        {chosenChoice && !chosenChoice.correct ? (
          <Animated.View entering={t.reduceMotion ? undefined : FadeIn.duration(300)} style={styles.feedback}>
            <Text variant="h3" tone="secondary">Not quite.</Text>
            <Text variant="body" tone="secondary" style={styles.feedbackBody}>
              {chosenChoice.response ?? 'Look again — take your time.'}
            </Text>
          </Animated.View>
        ) : null}

        {settled ? (
          <Animated.View
            entering={t.reduceMotion ? undefined : FadeInDown.duration(600)}
            style={[styles.feedback, { borderTopColor: t.colors.border }]}
          >
            <Text variant="h2" tone="accent">{step.affirmation}</Text>
            <Text variant="bodyLarge" tone="secondary" style={styles.feedbackBody}>
              {step.explanation}
            </Text>
          </Animated.View>
        ) : null}
      </ScrollView>

      {settled ? <Button label="Continue" onPress={onAdvance} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between', gap: 18 },
  scroll: { paddingTop: 18, paddingBottom: 20 },
  quote: { padding: 22, borderWidth: StyleSheet.hairlineWidth * 2, marginBottom: 26 },
  quoteRef: { marginTop: 14 },
  prompt: { marginBottom: 26 },
  choices: { gap: 11 },
  feedback: { marginTop: 26, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth },
  feedbackBody: { marginTop: 10 },
});
