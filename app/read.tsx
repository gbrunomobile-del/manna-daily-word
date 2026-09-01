import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Check, ArrowRight, HelpCircle } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { LampIndicator } from '@/components/manna/LampIndicator';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { getDayReading, passagesForDay } from '@/data/year-plan';
import { useGathered, chapterId } from '@/store/gathered';
import { useProgress, planDay, currentStreak, useTimeInWord } from '@/store/progress';
import { hasChapterQuestions } from '@/data/way-questions';

interface Passage {
  reference: string;
  label: string;
  /** Where tapping this passage opens the reader. */
  book: string;
  chapter: number;
}

const LABELS = ['Old Testament', 'New Testament', 'Psalm', 'Proverb'];

/**
 * Resolve the opening chapter of a plan reference so it can be opened in the
 * reader: "Genesis 1-2" and "Genesis 50 - Exodus 2" both start at Genesis 50/1.
 *
 * The plan writes "Psalm 23" where the canon lists the book as "Psalms", so
 * that one name is normalised here rather than in the plan, which reads better
 * as a reference.
 */
function openAt(reference: string): { book: string; chapter: number } | null {
  const first = reference.split(' - ')[0].trim();
  const m = first.match(/^(.+?)\s+(\d+)(?:-\d+)?$/);
  if (!m) return null;
  const book = m[1].trim() === 'Psalm' ? 'Psalms' : m[1].trim();
  return { book, chapter: Number(m[2]) };
}

export default function DailyReading() {
  const t = useTheme();
  const router = useRouter();
  const { day: dayParam } = useLocalSearchParams<{ day: string }>();
  const [day, setDay] = useState(Number(dayParam) || 1);

  const { startDate, completedLessonIds, gatheredDates, totalSeconds } = useProgress();
  const today = planDay(startDate);

  /** Whether this chapter's questions have been answered. */
  const answered = useCallback(
    (id: string) => completedLessonIds.includes(`chapter-${id}`),
    [completedLessonIds],
  );

  const reading = getDayReading(day);
  const { gather, hasGathered, hydrate, hydrated, chapters } = useGathered();
  const recordDay = useProgress((s) => s.gather);

  const [complete, setComplete] = useState(false);

  // The daily portion counts as time in the Word.
  useTimeInWord();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  /**
   * The passages are derived, not fetched — the reader loads the text when a
   * passage is opened. This screen is the day's plan, not the page itself.
   */
  const passages: Passage[] = React.useMemo(
    () =>
      passagesForDay(day)
        .map((reference, i) => {
          const at = openAt(reference);
          if (!at) return null;
          return { reference, label: LABELS[i] ?? '', ...at };
        })
        .filter(Boolean) as Passage[],
    [day],
  );

  const allGathered = passages.length > 0 && passages.every((p) => hasGathered(p.reference));

  /** Gather one passage on its own — the day need not be done in one sitting. */
  const gatherOne = useCallback(async (reference: string) => {
    feedback.success?.();
    await gather(reference);
  }, [gather]);

  const handleComplete = useCallback(async () => {
    feedback.success?.();
    // Two records: the chapters themselves, and the day — the day is what
    // carries the streak on Today.
    await Promise.all([
      gather(passagesForDay(day)),
      recordDay(`day-${day}`, 0),
    ]);
    setComplete(true);
  }, [day, gather, recordDay]);

  if (!reading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]}>
        <View style={styles.centre}>
          <Text variant="body" tone="muted">That day is not in the plan.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (complete) {
    const streak = currentStreak(gatheredDates);
    const chapterCount = Object.keys(chapters).length;
    const minutes = Math.round(totalSeconds / 60);

    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.immersive }]}>
        <ScrollView contentContainerStyle={styles.gathered} showsVerticalScrollIndicator={false}>
          {/* The lamp, lit and breathing. Nothing bursts or explodes here —
              the day is closed quietly. */}
          <Animated.View entering={FadeIn.duration(700)} style={styles.lampWrap}>
            <LampIndicator remaining={1} total={1} size={78} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(620)} style={styles.gatheredHead}>
            <Text variant="display" uppercase style={[styles.gatheredTitle, { color: t.colors.accent }]}>
              Gathered
            </Text>
            <Text variant="bodyLarge" style={[styles.gatheredLead, { color: t.colors.onImmersive }]}>
              You have taken today&apos;s portion.
            </Text>
            <Text variant="body" style={[styles.gatheredLead, { color: t.colors.onImmersiveMuted }]}>
              Wisdom for today. Strength for tomorrow.
            </Text>
          </Animated.View>

          {/* Only figures that mean something — no points, no score. */}
          <Animated.View entering={FadeInDown.delay(340).duration(560)} style={styles.figures}>
            {[
              { value: String(passages.length), label: passages.length === 1 ? 'passage' : 'passages' },
              // Only shown once there is a minute to show — “0 min” says nothing.
              ...(minutes > 0 ? [{ value: String(minutes), label: 'min in the Word' }] : []),
              { value: String(streak), label: streak === 1 ? 'day gathered' : 'days gathered' },
              { value: String(chapterCount), label: 'chapters in all' },
            ].map((f) => (
              <View key={f.label} style={styles.figure}>
                <Text variant="h2" style={{ color: t.colors.onImmersive }}>{f.value}</Text>
                <Text variant="caption" style={{ color: t.colors.onImmersiveMuted, marginTop: 3 }}>
                  {f.label}
                </Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(480).duration(600)} style={styles.psalm}>
            <Ornament width={108} opacity={0.4} />
            <Text
              variant="scripture"
              style={[styles.psalmText, { color: t.colors.onImmersive, fontFamily: t.fonts.serifItalic }]}
            >
              Your word is a lamp to my feet, and a light for my path.
            </Text>
            <Text variant="reference" uppercase style={{ color: t.colors.accent, marginTop: 16 }}>
              Psalm 119:105
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(620).duration(520)} style={styles.gatheredCta}>
            <Button label="Continue journey" variant="primary" arrow onPress={() => router.back()} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: t.colors.border + '44' }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={22} color={t.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted" uppercase>Day {day} of 365</Text>
          <Text variant="body" style={{ color: t.colors.text, fontFamily: t.fonts.sansSemi }}>
            {day === today
              ? "Today's portion"
              : day === today - 1
              ? "Yesterday's portion"
              : day < today
              ? `${today - day} days back`
              : 'Still ahead'}
          </Text>
        </View>
      </View>

      {(
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {passages.map((p, i) => {
            const done = hasGathered(p.reference);
            return (
              <Animated.View
                key={p.reference}
                entering={FadeIn.delay(i * 80).duration(400)}
                style={[
                  styles.passage,
                  {
                    backgroundColor: done ? t.colors.accent + '0E' : t.colors.surface,
                    borderColor: done ? t.colors.accent + '38' : t.colors.border,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Read ${p.reference}`}
                  onPress={() => {
                    feedback.select();
                    router.push(
                      `/book?name=${encodeURIComponent(p.book)}&chapter=${p.chapter}`,
                    );
                  }}
                >
                  <View style={styles.passageHead}>
                    <Text variant="caption" tone="muted" uppercase>{p.label}</Text>
                    {done && (
                      <View style={[styles.gatheredPill, { backgroundColor: t.colors.accent + '20' }]}>
                        <Text style={{ color: t.colors.accent, fontSize: 10, letterSpacing: 0.6 }}>
                          GATHERED
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.refRow}>
                    <Text variant="title" style={{ color: t.colors.text, flex: 1 }}>
                      {p.reference}
                    </Text>
                    <ArrowRight size={19} color={t.colors.accent} strokeWidth={2} />
                  </View>
                </Pressable>

                {!done && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => gatherOne(p.reference)}
                    style={[styles.gatherOne, { borderTopColor: t.colors.border + '88' }]}
                  >
                    <Check size={15} color={t.colors.accent} strokeWidth={2.2} />
                    <Text variant="caption" style={{ color: t.colors.accent }}>
                      Mark as gathered
                    </Text>
                  </Pressable>
                )}

                {/* Only where the chapter has something worth asking about. */}
                {hasChapterQuestions(chapterId(`${p.book} ${p.chapter}`)) && (() => {
                  const id = chapterId(`${p.book} ${p.chapter}`);
                  const isAnswered = answered(id);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Answer questions on ${p.reference}`}
                      onPress={() => {
                        feedback.select();
                        router.push({ pathname: '/way/lesson', params: { chapter: id } });
                      }}
                      style={[styles.gatherOne, { borderTopColor: t.colors.border + '88' }]}
                    >
                      {isAnswered ? (
                        <Check size={15} color={t.colors.accent} strokeWidth={2.2} />
                      ) : (
                        <HelpCircle size={15} color={t.colors.textMuted} strokeWidth={2} />
                      )}
                      <Text
                        variant="caption"
                        style={{ color: isAnswered ? t.colors.accent : t.colors.textMuted }}
                      >
                        {isAnswered ? 'Questions answered' : 'Three questions on this reading'}
                      </Text>
                    </Pressable>
                  );
                })()}
              </Animated.View>
            );
          })}

          <View style={{ height: 14 }} />
          <Button
            label={allGathered ? 'Complete this day' : 'Gather the whole day'}
            variant="primary"
            onPress={handleComplete}
          />

          {/* Move between days — a missed day is not lost, just behind you. */}
          <View style={styles.dayNav}>
            <Pressable
              disabled={day <= 1}
              onPress={() => { feedback.select(); setDay(day - 1); }}
              style={[styles.dayBtn, { borderColor: t.colors.border, opacity: day <= 1 ? 0.35 : 1 }]}
            >
              <ChevronLeft size={17} color={t.colors.text} strokeWidth={2} />
              <Text variant="caption" style={{ color: t.colors.text }}>Day {day - 1}</Text>
            </Pressable>

            <Pressable
              disabled={day >= 365}
              onPress={() => { feedback.select(); setDay(day + 1); }}
              style={[styles.dayBtn, { borderColor: t.colors.border, opacity: day >= 365 ? 0.35 : 1 }]}
            >
              <Text variant="caption" style={{ color: t.colors.text }}>Day {day + 1}</Text>
              <ChevronRight size={17} color={t.colors.text} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 48 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { padding: 4 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  passage: { borderWidth: 1, borderRadius: 18, padding: 20, marginBottom: 14 },
  passageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  gatherOne: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth, marginTop: 16, paddingTop: 14, minHeight: 44,
  },
  gatheredPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  dayNav: { flexDirection: 'row', gap: 12, marginTop: 28 },
  dayBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderRadius: 12, paddingVertical: 14,
  },
  vessel: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  gathered: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 48 },
  lampWrap: { alignItems: 'center' },
  gatheredHead: { alignItems: 'center', marginTop: 30 },
  // Display type needs a line box well over the font size or the capitals clip.
  gatheredTitle: { letterSpacing: 5, lineHeight: 58, paddingTop: 6, textAlign: 'center' },
  gatheredLead: { textAlign: 'center', marginTop: 12, lineHeight: 26 },
  figures: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 44 },
  figure: { flex: 1, alignItems: 'center' },
  psalm: { alignItems: 'center', marginTop: 52 },
  psalmText: { textAlign: 'center', marginTop: 22, lineHeight: 34 },
  gatheredCta: { marginTop: 52 },
});
