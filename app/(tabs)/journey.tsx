import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { ScreenHeader } from '@/components/manna/ScreenHeader';
import { SCREEN_ART } from '@/components/manna/screen-art';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { getDayReading, passagesForDay, TOTAL_DAYS } from '@/data/year-plan';
import { useGathered, TOTAL_CHAPTERS } from '@/store/gathered';
import { useProgress, planDay } from '@/store/progress';

/**
 * The year is shown in twelve blocks of thirty days rather than calendar
 * months, because the plan starts whenever someone joined — labelling day 1
 * as "January" would be wrong for everyone who didn't begin on New Year's Day.
 */
const BLOCK = 30;
const BLOCKS = Array.from({ length: Math.ceil(TOTAL_DAYS / BLOCK) }, (_, i) => ({
  start: i * BLOCK + 1,
  days: Math.min(BLOCK, TOTAL_DAYS - i * BLOCK),
}));

export default function Journey() {
  const t = useTheme();
  const router = useRouter();
  const { chapters, hydrate, hydrated, hasGathered } = useGathered();
  const { startDate, hydrate: hydrateProgress, hydrated: progressReady } = useProgress();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);
  useEffect(() => { if (!progressReady) void hydrateProgress(); }, [progressReady, hydrateProgress]);

  const today = useMemo(() => planDay(startDate), [startDate]);
  const gatheredCount = Object.keys(chapters).length;
  const pct = Math.min(100, Math.round((gatheredCount / TOTAL_CHAPTERS) * 100));

  /** A plan day counts as gathered when all four of its passages are. */
  const isDayGathered = (day: number) =>
    passagesForDay(day).every((ref) => hasGathered(ref));

  const daysGathered = useMemo(() => {
    let n = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) if (isDayGathered(d)) n++;
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  const todayReading = getDayReading(today);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          art={SCREEN_ART.journey}
          eyebrow="The Journey"
          title="A year in the Word"
        />

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
              onPress={() => { feedback.select(); router.push(`/read?day=${today}`); }}
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

        {/* Year calendar */}
        <Text variant="caption" tone="muted" uppercase style={{ marginTop: 30, marginBottom: 12 }}>
          The year
        </Text>

        {BLOCKS.map((b, bi) => (
          <Animated.View
            key={b.start}
            entering={FadeInDown.delay(180 + bi * 26).duration(400)}
            style={styles.month}
          >
            <Text variant="caption" tone="muted" style={styles.monthName}>
              Days {b.start}–{b.start + b.days - 1}
            </Text>
            <View style={styles.grid}>
              {Array.from({ length: b.days }, (_, i) => {
                const dayNum = b.start + i;
                if (dayNum > TOTAL_DAYS) return null;
                const gathered = isDayGathered(dayNum);
                const isToday = dayNum === today;
                const future = dayNum > today;
                return (
                  <Pressable
                    key={dayNum}
                    onPress={() => { feedback.select(); router.push(`/read?day=${dayNum}`); }}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: gathered ? t.colors.accent : 'transparent',
                        borderColor: isToday || gathered
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
