import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ArrowRight, User } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { PaperGrain } from '@/components/primitives/Screen';
import { Ornament } from '@/components/manna/Ornament';
import { SCREEN_ART } from '@/components/manna/screen-art';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { fetchChapter } from '@/services/bible';
import { getDayReading, passagesForDay, TOTAL_DAYS } from '@/data/year-plan';
import { DEFAULT_VERSION } from '@/data/versions';
import { useGathered } from '@/store/gathered';
import { useWay } from '@/store/way';
import { useTreasure, treasuredCount, readyCount } from '@/store/treasure';
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

/** Opening chapter of a plan reference, so the portion can be previewed. */
function openAt(reference: string): { book: string; chapter: number } | null {
  const first = reference.split(' - ')[0].trim();
  const m = first.match(/^(.+?)\s+(\d+)(?:-\d+)?$/);
  if (!m) return null;
  const book = m[1].trim() === 'Psalm' ? 'Psalms' : m[1].trim();
  return { book, chapter: Number(m[2]) };
}

export default function Today() {
  const t = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');

  const { gatheredDates, startDate, hydrate: hydrateProgress, hydrated: progressReady } = useProgress();
  const { hasGathered, hydrate: hydrateGathered, hydrated: gatheredReady, chapters } = useGathered();
  const { completed, hydrate: hydrateWay, hydrated: wayReady } = useWay();
  const {
    items: treasureItems, hydrate: hydrateTreasure, hydrated: treasureReadyState,
  } = useTreasure();

  const treasureKept = treasuredCount(treasureItems);
  const treasureReady = readyCount(treasureItems);

  useEffect(() => {
    if (!progressReady) void hydrateProgress();
    if (!gatheredReady) void hydrateGathered();
    if (!wayReady) void hydrateWay();
    if (!treasureReadyState) void hydrateTreasure();
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

  /**
   * The opening verse of today's Old Testament portion, shown as a taste of
   * what is waiting. Fetched rather than stored: the plan holds references,
   * and inventing an excerpt would mean inventing Scripture.
   */
  const [excerpt, setExcerpt] = useState<string>('');
  const otOpen = reading ? openAt(reading.ot) : null;

  useEffect(() => {
    if (!otOpen) { setExcerpt(''); return; }
    let alive = true;
    fetchChapter(otOpen.book, otOpen.chapter, DEFAULT_VERSION)
      .then((vs) => { if (alive && vs[0]) setExcerpt(vs[0].text); })
      .catch(() => { /* the portion still reads fine without it */ });
    return () => { alive = false; };
  }, [otOpen?.book, otOpen?.chapter]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <PaperGrain />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile sits here rather than in the bar, which keeps the tabs to
            five and gives the fifth to something used every day. */}
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="You"
            onPress={() => { feedback.select(); router.push('/you'); }}
            hitSlop={10}
            style={[styles.profile, { borderColor: t.colors.border }]}
          >
            <User size={17} color={t.colors.textMuted} strokeWidth={1.7} />
          </Pressable>
        </View>

        {/* Greeting */}
        <Animated.View entering={FadeIn.duration(420)}>
          <Text variant="label" tone="muted" uppercase>
            {returning ? 'Welcome back' : greeting()}
          </Text>
          <Text variant="hero" style={{ color: t.colors.text, marginTop: 8 }}>
            {returning
              ? 'Your portion is waiting.'
              : name
              ? `${greeting()}, ${name}.`
              : 'Gather truth. Daily.'}
          </Text>
        </Animated.View>

        {/* Days gathered — stated quietly, on a hairline rather than in a card */}
        <Animated.View
          entering={FadeInDown.delay(70).duration(440)}
          style={[styles.gathered, { borderColor: t.colors.border }]}
        >
          <View>
            <Text variant="h2" style={{ color: t.colors.text }}>{streak}</Text>
            <Text variant="caption" tone="muted">
              {streak === 1 ? 'day gathered' : 'days gathered'}
            </Text>
          </View>
          <View style={styles.dots}>
            {dots.map((filled, i) => (
              <View
                key={i}
                style={[
                  styles.dotRing,
                  { borderColor: filled ? t.colors.accent : t.colors.border },
                ]}
              >
                {filled && <View style={[styles.dotCore, { backgroundColor: t.colors.accent }]} />}
              </View>
            ))}
          </View>
        </Animated.View>

        {returning && (
          <Text variant="bodySmall" tone="muted" style={{ marginTop: 12 }}>
            However long it has been, today counts.
          </Text>
        )}

        {/* Today's portion — the engraving sits behind it and dissolves */}
        {reading && (
          <Animated.View entering={FadeInDown.delay(140).duration(440)} style={styles.portion}>
            {SCREEN_ART.today && (
              <View style={styles.portionArt} pointerEvents="none">
                <Image source={SCREEN_ART.today} style={styles.portionImage} resizeMode="contain" />
                <LinearGradient
                  colors={[t.colors.background + '00', t.colors.background]}
                  locations={[0, 0.82]}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )}

            <Text variant="label" tone="muted" uppercase>Today&apos;s portion</Text>
            <Text variant="h1" style={{ color: t.colors.text, marginTop: 8 }}>
              {reading.ot}
            </Text>

            {!!excerpt && (
              <Text
                variant="scripture"
                style={[styles.excerpt, { color: t.colors.textSecondary, fontFamily: t.fonts.serifItalic }]}
                numberOfLines={3}
              >
                {excerpt}
              </Text>
            )}

            {/* The whole portion, as hairline rows */}
            <View style={styles.refs}>
              {refs.map((ref, i) => {
                const done = hasGathered(ref);
                return (
                  <View key={ref} style={[styles.refRow, { borderTopColor: t.colors.border }]}>
                    <View
                      style={[
                        styles.refDot,
                        {
                          backgroundColor: done ? t.colors.accent : 'transparent',
                          borderColor: done ? t.colors.accent : t.colors.border,
                        },
                      ]}
                    />
                    <Text
                      variant="body"
                      style={{ flex: 1, color: done ? t.colors.textMuted : t.colors.text }}
                    >
                      {ref}
                    </Text>
                    <Text variant="caption" tone="muted">{LABELS[i]}</Text>
                  </View>
                );
              })}
            </View>

            <Button
              label={
                doneToday ? 'Read again'
                : portionDone > 0 ? `Continue · ${portionDone} of ${refs.length}`
                : 'Begin reading'
              }
              arrow
              onPress={() => { feedback.select(); router.push(`/read?day=${day}`); }}
              style={styles.portionCta}
            />

            <Text variant="caption" tone="muted" style={styles.dayLine}>
              Day {day} of {TOTAL_DAYS}
            </Text>
          </Animated.View>
        )}

        {/* Daily lesson */}
        {nextTopic && (
          <Animated.View entering={FadeInDown.delay(210).duration(440)} style={styles.lessonBlock}>
            <Text variant="label" tone="muted" uppercase>Daily lesson</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Continue ${WAY_TITLES[nextTopic]}`}
              onPress={() => {
                feedback.select();
                router.push({ pathname: '/way/lesson', params: { skillId: nextTopic } });
              }}
              style={[styles.lesson, { backgroundColor: t.colors.primary }]}
            >
              <View style={styles.lessonHead}>
                <Image source={WAY_ART[nextTopic]} style={styles.lessonArt} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text variant="h2" style={{ color: t.colors.onImmersive }}>
                    {WAY_TITLES[nextTopic]}
                  </Text>
                  <Text variant="caption" style={{ color: t.colors.onImmersiveMuted, marginTop: 3 }}>
                    {completed.length} of {WAY_ORDER.length} gathered
                  </Text>
                </View>
                <Text variant="h3" style={{ color: t.colors.onPrimary }}>
                  {Math.round((completed.length / WAY_ORDER.length) * 100)}%
                </Text>
              </View>

              <View style={[styles.lessonTrack, { backgroundColor: 'rgba(245,239,227,0.16)' }]}>
                <View
                  style={[
                    styles.lessonFill,
                    {
                      backgroundColor: t.colors.accent,
                      width: `${Math.max((completed.length / WAY_ORDER.length) * 100, 2)}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.lessonCta}>
                <Text variant="label" uppercase style={{ color: t.colors.onPrimary, letterSpacing: 1.4 }}>
                  Continue lesson
                </Text>
                <ArrowRight size={17} color={t.colors.onPrimary} strokeWidth={2} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Treasure — a quiet line, not a second card competing with the lesson */}
        <Animated.View entering={FadeInDown.delay(250).duration(440)} style={styles.treasureBlock}>
          <Text variant="label" tone="muted" uppercase>Treasure</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Treasure, Scripture memory"
            onPress={() => { feedback.select(); router.push('/treasure'); }}
            style={[styles.treasure, { borderTopColor: t.colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="h3" style={{ color: t.colors.text }}>
                {treasureReady > 0
                  ? `${treasureReady} ${treasureReady === 1 ? 'Scripture is' : 'Scriptures are'} ready to remember.`
                  : treasureKept > 0
                  ? `${treasureKept} ${treasureKept === 1 ? 'Scripture' : 'Scriptures'} treasured.`
                  : 'Begin keeping the Word.'}
              </Text>
              <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
                Keep the Word you have gathered.
              </Text>
            </View>
            <ArrowRight size={18} color={t.colors.accent} strokeWidth={2} />
          </Pressable>
        </Animated.View>

        {/* Quiet footer stat */}
        <Animated.View entering={FadeInDown.delay(320).duration(440)} style={styles.footer}>
          <Ornament width={96} opacity={0.3} />
          <Text variant="caption" tone="muted" style={{ marginTop: 14 }}>
            {Object.keys(chapters).length} chapters gathered so far
          </Text>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 18 },
  profile: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  gathered: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 18, marginTop: 28,
  },
  dots: { flexDirection: 'row', gap: 9 },
  dotRing: {
    width: 14, height: 14, borderRadius: 7, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  dotCore: { width: 6, height: 6, borderRadius: 3 },

  portion: { marginTop: 44 },
  // The engraving sits behind the portion and dissolves into the page rather
  // than being boxed — atmosphere, not an illustration slot.
  portionArt: {
    position: 'absolute', top: -34, right: -46, width: 250, height: 250, opacity: 0.5,
  },
  portionImage: { width: '100%', height: '100%' },
  excerpt: { marginTop: 16 },
  refs: { marginTop: 28 },
  refRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 13,
  },
  refDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  portionCta: { marginTop: 26 },
  dayLine: { marginTop: 14, textAlign: 'center' },

  lessonBlock: { marginTop: 52, gap: 14 },
  treasureBlock: { marginTop: 48, gap: 14 },
  treasure: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 18, minHeight: MIN_TOUCH,
  },
  lesson: { borderRadius: 22, padding: 22, gap: 18 },
  lessonHead: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  lessonArt: { width: 52, height: 52 },
  lessonTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  lessonFill: { height: '100%', borderRadius: 2 },
  lessonCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: MIN_TOUCH - 20,
  },

  footer: { alignItems: 'center', marginTop: 56 },
});
