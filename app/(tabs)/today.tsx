import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Check, ArrowRight } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Ornament } from '@/components/manna/Ornament';
import { SCREEN_ART } from '@/components/manna/screen-art';
import { ScreenHeader } from '@/components/manna/ScreenHeader';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { getDayReading, passagesForDay, TOTAL_DAYS } from '@/data/year-plan';
import { useGathered } from '@/store/gathered';
import { useWay } from '@/store/way';
import {
  useProgress, weekDots, currentStreak, gatheredToday, isReturning, planDay,
} from '@/store/progress';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** The Way, in tree order — used to find the next unlocked topic. */
const WAY_ORDER = [
  'creation', 'the-fall', 'noah', 'abraham', 'joseph', 'moses', 'the-law',
  'david', 'isaiah', 'birth', 'ministry', 'miracles', 'cross', 'acts',
  'letters', 'revelation',
] as const;

const WAY_TITLES: Record<string, string> = {
  creation: 'Creation', 'the-fall': 'The Fall', noah: 'Noah', abraham: 'Abraham',
  joseph: 'Joseph', moses: 'Moses', 'the-law': 'The Law', david: 'David',
  isaiah: 'Isaiah', birth: 'Birth of Jesus', ministry: 'Ministry',
  miracles: 'Miracles', cross: 'Death & Resurrection', acts: 'Acts',
  letters: "Paul's Letters", revelation: 'Revelation',
};

const WAY_ART: Record<string, ImageSourcePropType> = {
  creation: require('../../assets/creation.png'),
  'the-fall': require('../../assets/the-fall.png'),
  noah: require('../../assets/noah.png'),
  abraham: require('../../assets/abraham.png'),
  joseph: require('../../assets/joseph.png'),
  moses: require('../../assets/moses.png'),
  'the-law': require('../../assets/the-law.png'),
  david: require('../../assets/david.png'),
  isaiah: require('../../assets/isaiah.png'),
  birth: require('../../assets/birth.png'),
  ministry: require('../../assets/ministry.png'),
  miracles: require('../../assets/miracles.png'),
  cross: require('../../assets/cross.png'),
  acts: require('../../assets/acts.png'),
  letters: require('../../assets/letters.png'),
  revelation: require('../../assets/revelation.png'),
};

const LABELS = ['Old Testament', 'New Testament', 'Psalm', 'Proverb'];

export default function Today() {
  const t = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');

  const { gatheredDates, startDate, hydrate: hydrateProgress, hydrated: progressReady } = useProgress();
  const { hasGathered, hydrate: hydrateGathered, hydrated: gatheredReady, chapters } = useGathered();
  const { completed, hydrate: hydrateWay, hydrated: wayReady } = useWay();

  useEffect(() => {
    if (!progressReady) void hydrateProgress();
    if (!gatheredReady) void hydrateGathered();
    if (!wayReady) void hydrateWay();
    void AsyncStorage.getItem('manna_user').then((raw) => {
      if (raw) { try { setName(JSON.parse(raw).name ?? ''); } catch { /* ignore */ } }
    });
  }, [progressReady, gatheredReady, wayReady, hydrateProgress, hydrateGathered, hydrateWay]);

  const day = useMemo(() => planDay(startDate), [startDate]);
  const reading = getDayReading(day);
  const refs = useMemo(() => passagesForDay(day), [day]);

  const doneToday = gatheredToday(gatheredDates);
  const streak = currentStreak(gatheredDates);
  const returning = isReturning(gatheredDates);
  const dots = weekDots(gatheredDates);

  // How much of today's portion is already behind you.
  const portionDone = refs.filter((r) => hasGathered(r)).length;

  // The next topic in The Way that hasn't been passed.
  const nextTopic = WAY_ORDER.find((id) => !completed.includes(id)) ?? null;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        {SCREEN_ART.today ? (
          <ScreenHeader
            art={SCREEN_ART.today}
            caption="Today"
            eyebrow={returning ? 'Welcome back' : undefined}
            title={
              returning
                ? 'Your portion is waiting.'
                : name
                ? `${greeting()}, ${name}.`
                : 'Gather truth. Daily.'
            }
          />
        ) : (
          <Animated.View entering={FadeIn.duration(420)}>
            <Text variant="caption" tone="muted" uppercase>
              {returning ? 'Welcome back' : greeting()}
            </Text>
            <Text variant="hero" style={{ color: t.colors.text, marginTop: 6 }}>
              {returning
                ? 'Your portion is waiting.'
                : name
                ? `${greeting()}, ${name}.`
                : 'Gather truth. Daily.'}
            </Text>
          </Animated.View>
        )}

        {/* Streak — stated, never scolded */}
        <Animated.View
          entering={FadeInDown.delay(70).duration(440)}
          style={[styles.streak, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}
        >
          <View style={styles.streakHead}>
            <View>
              <Text variant="title" style={{ color: t.colors.accent }}>
                {streak}
              </Text>
              <Text variant="caption" tone="muted">
                {streak === 1 ? 'day gathered' : 'days gathered'}
              </Text>
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
          </View>
          {returning && (
            <Text variant="caption" tone="muted" style={{ marginTop: 10 }}>
              However long it has been, today counts.
            </Text>
          )}
        </Animated.View>

        {/* Today's portion */}
        {reading && (
          <Animated.View entering={FadeInDown.delay(140).duration(440)}>
            <View style={styles.sectionHead}>
              <Ornament width={128} opacity={0.5} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Read day ${day} of the year plan`}
              onPress={() => { feedback.select(); router.push(`/read?day=${day}`); }}
              style={[
                styles.portion,
                {
                  backgroundColor: doneToday ? t.colors.accent + '10' : t.colors.surface,
                  borderColor: doneToday ? t.colors.accent + '44' : t.colors.border,
                },
              ]}
            >
              <View style={styles.portionHead}>
                <Text variant="caption" tone="muted" uppercase>
                  Day {day} of {TOTAL_DAYS}
                </Text>
                {doneToday && (
                  <View style={[styles.tick, { backgroundColor: t.colors.accent }]}>
                    <Check size={12} color={t.colors.background} strokeWidth={3} />
                  </View>
                )}
              </View>

              <Text variant="title" style={{ color: t.colors.text, marginTop: 6, marginBottom: 14 }}>
                {doneToday ? 'Gathered today' : "Today's portion"}
              </Text>

              {refs.map((ref, i) => {
                const done = hasGathered(ref);
                return (
                  <View key={ref} style={styles.refRow}>
                    <View
                      style={[
                        styles.refDot,
                        { backgroundColor: done ? t.colors.accent : t.colors.border },
                      ]}
                    />
                    <Text
                      variant="body"
                      style={{
                        color: done ? t.colors.textMuted : t.colors.text,
                        flex: 1,
                      }}
                    >
                      {ref}
                    </Text>
                    <Text variant="caption" tone="muted">{LABELS[i]}</Text>
                  </View>
                );
              })}

              <View style={[styles.cta, { borderTopColor: t.colors.border + '77' }]}>
                <Text variant="body" style={{ color: t.colors.accent, fontFamily: t.fonts.sansSemi }}>
                  {doneToday
                    ? 'Read again'
                    : portionDone > 0
                    ? `Continue · ${portionDone} of ${refs.length} gathered`
                    : 'Begin reading'}
                </Text>
                <ArrowRight size={17} color={t.colors.accent} strokeWidth={2} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Next on The Way */}
        {nextTopic && (
          <Animated.View entering={FadeInDown.delay(210).duration(440)}>
            <Text variant="caption" tone="muted" uppercase style={styles.sectionLabel}>
              Next on The Way
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Start ${WAY_TITLES[nextTopic]}`}
              onPress={() => {
                feedback.select();
                router.push({ pathname: '/way/lesson', params: { skillId: nextTopic } });
              }}
              style={[styles.wayCard, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}
            >
              <Image source={WAY_ART[nextTopic]} style={styles.wayArt} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ color: t.colors.text, fontFamily: t.fonts.sansSemi }}>
                  {WAY_TITLES[nextTopic]}
                </Text>
                <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                  Five questions · {completed.length} of {WAY_ORDER.length} gathered
                </Text>
              </View>
              <ArrowRight size={18} color={t.colors.accent} strokeWidth={2} />
            </Pressable>
          </Animated.View>
        )}

        {/* Quiet footer stat */}
        <Animated.View entering={FadeInDown.delay(280).duration(440)} style={styles.footer}>
          <Ornament width={96} opacity={0.32} />
          <Text variant="caption" tone="muted" style={{ marginTop: 12 }}>
            {Object.keys(chapters).length} chapters gathered so far
          </Text>
        </Animated.View>

        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  streak: { borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 22 },
  streakHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1 },
  sectionHead: { alignItems: 'center', marginTop: 30, marginBottom: 14 },
  sectionLabel: { marginTop: 30, marginBottom: 10, letterSpacing: 1 },
  portion: { borderWidth: 1, borderRadius: 20, padding: 20 },
  portionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tick: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  refDot: { width: 6, height: 6, borderRadius: 3 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth, marginTop: 14, paddingTop: 14,
    minHeight: MIN_TOUCH,
  },
  wayCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderRadius: 18, padding: 14, minHeight: MIN_TOUCH,
  },
  wayArt: { width: 54, height: 54, borderRadius: 14 },
  footer: { alignItems: 'center', marginTop: 40 },
});
