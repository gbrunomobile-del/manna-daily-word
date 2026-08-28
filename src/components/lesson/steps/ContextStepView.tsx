import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Pill } from '@/components/primitives/Pill';
import { useTheme } from '@/theme';
import type { ContextStep } from '@/types';

type Props = { step: ContextStep; onAdvance: () => void };

export const ContextStepView = ({ step, onAdvance }: Props) => {
  const t = useTheme();
  return (
    <View style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Pill label="Manna commentary" tone="neutral" />
        <Text variant="h1" style={styles.title}>{step.title}</Text>
        {step.commentary.body.map((para, i) => (
          <Animated.View
            key={i}
            entering={t.reduceMotion ? undefined : FadeInDown.delay(120 + i * 110).duration(700)}
          >
            <Text variant="bodyLarge" tone="secondary" style={styles.para}>{para}</Text>
          </Animated.View>
        ))}
        {step.commentary.contested ? (
          <Text variant="bodySmall" tone="muted" style={styles.contested}>
            {step.commentary.contested}
          </Text>
        ) : null}
      </ScrollView>
      <Button label="Continue" onPress={onAdvance} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between', gap: 20 },
  scroll: { paddingTop: 16, paddingBottom: 24 },
  title: { marginTop: 16, marginBottom: 20 },
  para: { marginBottom: 18 },
  contested: { marginTop: 6, fontStyle: 'italic' },
});
