import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { ProgressBar } from '@/components/primitives/ProgressBar';
import { ScriptureStepView } from '@/components/lesson/steps/ScriptureStepView';
import { ContextStepView } from '@/components/lesson/steps/ContextStepView';
import { ChoiceStepView } from '@/components/lesson/steps/ChoiceStepView';
import { RevealStepView } from '@/components/lesson/steps/RevealStepView';
import { FillBlankStepView } from '@/components/lesson/steps/FillBlankStepView';
import { ReflectionStepView } from '@/components/lesson/steps/ReflectionStepView';
import { useTheme, HIT_SLOP } from '@/theme';
import { getLesson } from '@/data/lessons';
import { track } from '@/services/analytics';
import type { LessonStep } from '@/types';

export default function LessonRunner() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = useMemo(() => (id ? getLesson(id) : undefined), [id]);
  const [index, setIndex] = useState(0);
  const startedAt = useRef(Date.now());

  const advance = useCallback(() => {
    if (!lesson) return;
    const step = lesson.steps[index];
    if (step) track({ name: 'lesson_step_completed', lessonId: lesson.id, stepId: step.id });

    if (index >= lesson.steps.length - 1) {
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      router.replace({ pathname: '/gathered', params: { lessonId: lesson.id, seconds: String(seconds) } });
      return;
    }
    setIndex((i) => i + 1);
  }, [index, lesson, router]);

  if (!lesson) return null;
  const step: LessonStep | undefined = lesson.steps[index];
  if (!step) return null;

  const render = () => {
    switch (step.type) {
      case 'SCRIPTURE':
        return <ScriptureStepView step={step} lesson={lesson} onAdvance={advance} />;
      case 'CONTEXT':
        return <ContextStepView step={step} onAdvance={advance} />;
      case 'MULTIPLE_CHOICE':
      case 'WHO_SAID_IT':
      case 'TRUE_FALSE':
      case 'CONTEXT_CHOICE':
        return <ChoiceStepView step={step} lessonId={lesson.id} onAdvance={advance} />;
      case 'REVEAL':
        return <RevealStepView step={step} lessonId={lesson.id} onAdvance={advance} />;
      case 'FILL_BLANK':
        return <FillBlankStepView step={step} onAdvance={advance} />;
      case 'REFLECTION':
        return <ReflectionStepView statement={step.statement} question={step.question} onAdvance={advance} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { paddingHorizontal: t.gutter }]}>
        <View style={styles.headerRow}>
          <View style={styles.progress}>
            <ProgressBar value={index + 1} total={lesson.steps.length} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Leave lesson"
            hitSlop={HIT_SLOP}
            onPress={() => router.back()}
          >
            <X size={20} color={t.colors.textMuted} strokeWidth={1.8} />
          </Pressable>
        </View>
        <Text variant="caption" tone="muted" style={styles.step}>
          Step {index + 1} of {lesson.steps.length}
        </Text>
      </View>

      <View style={[styles.content, { paddingHorizontal: t.gutter }]}>{render()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 10, paddingBottom: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  progress: { flex: 1 },
  step: { marginTop: 10, letterSpacing: 0.6 },
  content: { flex: 1, paddingBottom: 14 },
});
