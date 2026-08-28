import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Pill } from '@/components/primitives/Pill';
import { AnswerCard, AnswerState } from '../AnswerCard';
import { RevealSeam } from '@/components/reveal/RevealSeam';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { track } from '@/services/analytics';
import { getConnection } from '@/data/connections/connections';
import { CONNECTION_LABEL } from '@/types';
import { PASSAGES } from '@/data/scripture/passages';
import type { RevealStep } from '@/types';

type Props = { step: RevealStep; lessonId: string; onAdvance: () => void };

/**
 * REVEAL — the signature interaction.
 * Ask, then uncover. The content stays the hero; the seam of light only
 * shows that two passages belong in the same conversation.
 */
export const RevealStepView = ({ step, lessonId, onAdvance }: Props) => {
  const t = useTheme();
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const connection = getConnection(step.connectionId);

  const chosenChoice = step.choices.find((c) => c.id === chosen);
  const correct = !!chosenChoice?.correct;

  const stateFor = (id: string): AnswerState => {
    if (correct) return step.choices.find((c) => c.id === id)?.correct ? 'correct' : 'disabled';
    if (chosen === id) return 'incorrect';
    return 'default';
  };

  const select = (id: string) => {
    const c = step.choices.find((x) => x.id === id);
    if (!c) return;
    setChosen(id);
    if (c.correct) {
      feedback.reveal();
      track({ name: 'answer_correct', lessonId, stepId: step.id });
    } else {
      track({ name: 'answer_incorrect', lessonId, stepId: step.id });
    }
  };

  const openReveal = () => {
    setRevealed(true);
    feedback.reveal();
    track({ name: 'reveal_opened', connectionId: step.connectionId });
  };

  if (!connection) return null;
  const left = PASSAGES['exodus-16-4'];
  const right = PASSAGES['john-6-32-33'];

  if (revealed && left && right) {
    return (
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Animated.View entering={t.reduceMotion ? undefined : FadeIn.duration(500)}>
            <Pill label={CONNECTION_LABEL[connection.type]} tone="accent" />
            <Text variant="h1" style={styles.title}>See the connection.</Text>
          </Animated.View>

          <View style={styles.seam}>
            <RevealSeam
              left={left}
              right={right}
              leftLabel="Exodus 16"
              rightLabel="John 6"
            />
          </View>

          <Animated.View
            entering={t.reduceMotion ? undefined : FadeInDown.delay(900).duration(800)}
            style={[styles.explain, { borderTopColor: t.colors.border }]}
          >
            <Text variant="reference" tone="muted" uppercase>Manna commentary</Text>
            {connection.explanation.map((p, i) => (
              <Text key={i} variant="bodyLarge" tone="secondary" style={styles.para}>{p}</Text>
            ))}
          </Animated.View>
        </ScrollView>
        <Button
          label="Continue"
          onPress={() => {
            track({ name: 'reveal_completed', connectionId: step.connectionId });
            onAdvance();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {step.quote ? (
          <View style={[styles.quote, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.card }]}>
            <Text variant="scripture">{step.quote}</Text>
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
              onPress={() => { if (!correct) select(c.id); }}
            />
          ))}
        </View>

        {chosenChoice && !correct ? (
          <Animated.View entering={t.reduceMotion ? undefined : FadeIn.duration(300)} style={styles.feedback}>
            <Text variant="h3" tone="secondary">Not quite.</Text>
            <Text variant="body" tone="secondary" style={styles.para}>
              {chosenChoice.response ?? 'Try again.'}
            </Text>
          </Animated.View>
        ) : null}

        {correct ? (
          <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.duration(600)} style={styles.feedback}>
            <Text variant="h2" tone="accent">Exactly.</Text>
            <Text variant="bodyLarge" tone="secondary" style={styles.para}>{connection.summary}</Text>
          </Animated.View>
        ) : null}
      </ScrollView>

      {correct ? <Button label="Reveal the connection" onPress={openReveal} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between', gap: 18 },
  scroll: { paddingTop: 18, paddingBottom: 20 },
  quote: { padding: 22, borderWidth: StyleSheet.hairlineWidth * 2, marginBottom: 26 },
  prompt: { marginBottom: 26 },
  choices: { gap: 11 },
  feedback: { marginTop: 26 },
  title: { marginTop: 14, marginBottom: 28 },
  seam: { marginBottom: 30 },
  explain: { paddingTop: 22, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  para: { marginTop: 12 },
});
