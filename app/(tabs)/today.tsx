import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { MorningLight } from '@/components/manna/MorningLight';
import { useTheme } from '@/theme';
import { useProgress, weekDots } from '@/store/progress';
import { getLesson, TODAYS_LESSON_ID } from '@/data/lessons';
import { track } from '@/services/analytics';

const greeting = (d: Date) => {
  const h = d.getHours();
  if (h < 12) return 'Good morning.';
  if (h < 17) return 'Good afternoon.';
  return 'Good evening.';
};

export default function Today() {
  const t = useTheme();
  const router = useRouter();
  const { daysGathered, gatheredDates } = useProgress();
  const lesson = getLesson(TODAYS_LESSON_ID);

  const today = useMemo(() => new Date(), []);
  const dateLabel = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const dots = weekDots(gatheredDates);

  if (!lesson) return null;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.gutter, paddingBottom: t.spacing.huge }}
      >
        <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.duration(600)}>
          <Text variant="reference" tone="muted" uppercase style={styles.date}>{dateLabel}</Text>
          <Text variant="body" tone="secondary" style={styles.greeting}>{greeting(today)}</Text>
          <Text variant="hero">Your manna is ready.</Text>
        </Animated.View>

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(120).duration(700)}
          style={styles.heroWrap}
        >
          <MorningLight height={252} />
        </Animated.View>

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(220).duration(700)}
          style={styles.cardWrap}
        >
          <Card raised>
            <Text variant="reference" tone="accent" uppercase>{lesson.eyebrow}</Text>
            <Text variant="h1" style={styles.lessonTitle}>{lesson.title}</Text>
            <Text variant="bodySmall" tone="muted" style={styles.meta}>
              Today’s journey · {lesson.estimatedMinutes} min
            </Text>
            <Button
              label="Gather today’s manna"
              onPress={() => {
                track({ name: 'daily_manna_started', lessonId: lesson.id });
                router.push(`/lesson/${lesson.id}`);
              }}
            />
          </Card>
        </Animated.View>

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(320).duration(700)}
          style={styles.streak}
        >
          <View style={styles.streakRow}>
            <Flame size={15} color={t.colors.accent} strokeWidth={1.9} />
            <Text variant="bodySmall" tone="secondary">{daysGathered} days gathered</Text>
          </View>
          <View style={styles.dots}>
            {dots.map((filled, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: filled ? t.colors.accent : 'transparent',
                    borderColor: filled ? t.colors.accent : t.colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  date: { marginTop: 10, marginBottom: 22 },
  greeting: { marginBottom: 2 },
  heroWrap: { marginTop: 26 },
  cardWrap: { marginTop: -34, paddingHorizontal: 6 },
  lessonTitle: { marginTop: 8, marginBottom: 6 },
  meta: { marginBottom: 22 },
  streak: { marginTop: 30, alignItems: 'center', gap: 12 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { flexDirection: 'row', gap: 9 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1 },
});
