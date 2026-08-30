import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { getDayReading, TOTAL_DAYS } from '@/data/plan/year-plan';
import { useGathered, TOTAL_CHAPTERS, expandReference } from '@/store/gathered';
import { passagesForDay } from '@/data/plan/year-plan';

/** Which plan day is "today" — day 1 is the first time the app is opened. */
function currentDay(): number {
  // Simple day-of-year mapping; a start-date preference can replace this later.
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.min(Math.floor(diff / 86_400_000), TOTAL_DAYS);
}

const MONTHS = [
  ['January', 31], ['February', 28], ['March', 31], ['April', 30],
  ['May', 31], ['June', 30], ['July', 31], ['August', 31],
  ['September', 30], ['October', 31], ['November', 30], ['December', 31],
] as const;

export default function Journey() {
  const t = useTheme();
  const router = useRouter();
  const { chapters, hydrate, hydrated, hasGathered } = useGathered();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  const today = useMemo(() => currentDay(), []);
  const gatheredCount = Object.keys(chapters).length;
  const pct = Math.min(100, Math.round((gatheredCount / TOTAL_CHAPTERS) * 100));

  /** A plan day counts as gathered when all four of its passages are. */
  const isDayGathered = (day: number) =>
    passagesForDay(day).every((ref) => hasGathered(ref));

  const daysGathered = useMemo(() => {
    let n = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) if (isDayGathered(d)) n++;
    return n;
  }, [chapters]);

  const todayReading = getDayReading(today);

  // Build the calendar: day-of-year index per month
  let dayCursor = 0;
  const monthBlocks = MONTHS.map(([name, days]) => {
    const start = dayCursor + 1;
    dayCursor += days;
    return { name, days, start };
  });

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text variant="caption" tone="muted" uppercase>The Journey</Text>
          <Text variant="hero" style={{ color: t.colors.text, marginTop: 6 }}>
            A year in the Word
          </Text>
        </Animated.View>

        {/* Progress summary */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(450)}
          style={[styles.summary, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}
        >
          <View style={styles.summaryRow}>
            <View style={styles.stat}>
              <Text variant="title" style={{ color: t.colors.accent }}>{daysGathered}</Text>
              <Text variant="caption" tone="muted">days gathered</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: t.colors.border }]} />
            <View style={styles.stat}>
              <Text variant="title" style={{ color: t.colors.text }}>{gatheredCount}</Text>
              <Text variant="caption" tone="muted">chapters</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: t.colors.border }]} />
            <View style={styles.stat}>
              <Text variant="title" style={{ color: t.colors.text }}>{pct}%</Text>
              <Text variant="caption" tone="muted">of the Bible</Text>
            </View>
          </View>

          <View style={[styles.track, { backgroundColor: t.colors.border + '55' }]}>
            <View style={[styles.trackFill, { backgroundColor: t.colors.accent, width: `${Math.max(pct, 1)}%` }]} />
          </View>
        </Animated.View>

        {/* Today's portion */}
        {todayReading && (
          <Animated.View entering={FadeInDown.delay(140).duration(450)}>
            <Pressable
              onPress={() => { feedback.select(); router.push(`/read/${today}`); }}
              style={[styles.todayCard, { backgroundColor: t.colors.accent + '12', borderColor: t.colors.accent + '44' }]}
            >
              <Text variant="caption" style={{ color: t.colors.accent, letterSpacing: 1 }} uppercase>
                Day {today} · Today
              </Text>
              <View style={styles.refList}>
                {[todayReading.ot, todayReading.nt, todayReading.psalm, todayReading.proverb].map((ref) => (
                  <Text key={ref} variant="body" style={{ color: t.colors.text }}>{ref}</Text>
                ))}
              </View>
              <Text variant="caption" style={{ color: t.colors.accent, marginTop: 10 }}>
                Read now →
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Calendar */}
        <Text variant="caption" tone="muted" uppercase style={{ marginTop: 30, marginBottom: 12 }}>
          The year
        </Text>

        {monthBlocks.map((m, mi) => (
          <Animated.View
            key={m.name}
            entering={FadeInDown.delay(180 + mi * 30).duration(400)}
            style={styles.month}
          >
            <Text variant="caption" tone="muted" style={styles.monthName}>{m.name}</Text>
            <View style={styles.grid}>
              {Array.from({ length: m.days }, (_, i) => {
                const dayNum = m.start + i;
                if (dayNum > TOTAL_DAYS) return null;
                const gathered = isDayGathered(dayNum);
                const isToday = dayNum === today;
                const future = dayNum > today;
                return (
                  <Pressable
                    key={dayNum}
                    onPress={() => { feedback.select(); router.push(`/read/${dayNum}`); }}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: gathered ? t.colors.accent : 'transparent',
                        borderColor: isToday
                          ? t.colors.accent
                          : gathered
                          ? t.colors.accent
                          : t.colors.border + (future ? '40' : '99'),
                        borderWidth: isToday ? 2 : 1,
                        opacity: future && !gathered ? 0.45 : 1,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </Animated.View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  summary: { borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 22, gap: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  divider: { width: StyleSheet.hairlineWidth, height: 32 },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 3 },
  todayCard: { borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 16 },
  refList: { marginTop: 10, gap: 3 },
  month: { marginBottom: 18 },
  monthName: { marginBottom: 8, letterSpacing: 0.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dot: { width: 13, height: 13, borderRadius: 7 },
});
