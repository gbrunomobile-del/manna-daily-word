import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RefreshCw } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { PaperGrain } from '@/components/primitives/Screen';
import { MannaMark } from '@/components/manna/MannaMark';
import { useTheme } from '@/theme';
import { useProgress, currentStreak } from '@/store/progress';
import { useGathered, chapterId, TOTAL_CHAPTERS } from '@/store/gathered';
import { useWay } from '@/store/way';
import { useTreasure, treasuredCount, readyCount } from '@/store/treasure';
import { BOOKS } from '@/data/books';
import { feedback } from '@/services/feedback';

/** Short form of the running update id — enough to match against eas update:list. */
const shortId = (id: string | null) => (id ? id.slice(0, 8) : 'embedded');

const formatWhen = (d: Date | null) => {
  if (!d) return 'shipped with the build';
  return d.toLocaleString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

/**
 * How the canon is grouped on this screen. Every figure below is counted from
 * chapters actually gathered — nothing here is estimated or seeded.
 */
const SECTIONS: { area: string; groups: string[] }[] = [
  { area: 'Law', groups: ['Law'] },
  { area: 'History', groups: ['History'] },
  { area: 'Poetry', groups: ['Poetry'] },
  { area: 'Prophets', groups: ['Major Prophets', 'Minor Prophets'] },
  { area: 'Gospels', groups: ['Gospels'] },
  { area: 'Letters', groups: ["Paul's Letters", 'General Letters'] },
  { area: 'Revelation', groups: ['Prophecy'] },
];

const Meter = ({ area, read, total }: { area: string; read: number; total: number }) => {
  const t = useTheme();
  const value = total === 0 ? 0 : read / total;
  return (
    <View style={styles.meter}>
      <View style={styles.meterHead}>
        <Text variant="bodySmall">{area}</Text>
        <Text variant="caption" tone="muted">{read} of {total}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: t.colors.surfacePressed }]}>
        <View
          style={[styles.fill, { width: `${value * 100}%`, backgroundColor: t.colors.accent }]}
        />
      </View>
    </View>
  );
};

export default function You() {
  const t = useTheme();
  const router = useRouter();
  const { daysGathered, gatheredDates, totalSeconds, savedPassageIds, hydrate: hydrateProgress, hydrated: progressReady } = useProgress();
  const { chapters, hydrate: hydrateGathered, hydrated: gatheredReady } = useGathered();
  const { completed, xp, hydrate: hydrateWay, hydrated: wayReady } = useWay();
  const {
    items: memory, hydrate: hydrateTreasure, hydrated: treasureReady,
  } = useTreasure();

  useEffect(() => {
    if (!progressReady) void hydrateProgress();
    if (!gatheredReady) void hydrateGathered();
    if (!wayReady) void hydrateWay();
    if (!treasureReady) void hydrateTreasure();
  }, [progressReady, gatheredReady, wayReady, hydrateProgress, hydrateGathered, hydrateWay]);

  const chapterCount = Object.keys(chapters).length;
  const streak = currentStreak(gatheredDates);

  /** Chapters gathered against chapters available, per section of the canon. */
  const sections = useMemo(
    () =>
      SECTIONS.map(({ area, groups }) => {
        const books = BOOKS.filter((b) => groups.includes(b.group));
        const total = books.reduce((sum, b) => sum + b.chapters, 0);
        let read = 0;
        for (const b of books) {
          for (let c = 1; c <= b.chapters; c++) {
            if (chapters[chapterId(`${b.name} ${c}`)] !== undefined) read++;
          }
        }
        return { area, read, total };
      }),
    [chapters],
  );

  const [checking, setChecking] = useState(false);
  const [updateNote, setUpdateNote] = useState('');

  /**
   * Fetch and apply an update immediately, rather than waiting for the usual
   * two launches. Useful while testing; harmless in production.
   */
  const checkForUpdate = useCallback(async () => {
    if (__DEV__) {
      setUpdateNote('Updates are disabled in development.');
      return;
    }
    setChecking(true);
    setUpdateNote('');
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setUpdateNote('Downloading\u2026');
        await Updates.fetchUpdateAsync();
        feedback.success?.();
        await Updates.reloadAsync();
      } else {
        setUpdateNote('You are on the latest version.');
      }
    } catch {
      setUpdateNote('Could not check right now.');
    } finally {
      setChecking(false);
    }
  }, []);

  const stats = [
    { label: 'Days gathered', value: String(daysGathered) },
    { label: 'Day streak', value: String(streak) },
    { label: 'Chapters', value: String(chapterCount) },
    { label: 'Min in the Word', value: String(Math.round(totalSeconds / 60)) },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <PaperGrain />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.gutter, paddingBottom: t.spacing.huge }}
      >
        <View style={styles.head}>
          <MannaMark size={40} strokeWidth={1.7} />
          <Text variant="hero" style={styles.title}>Your journey</Text>
        </View>

        <View style={styles.stats}>
          {stats.map((s, i) => (
            <Animated.View
              key={s.label}
              entering={t.reduceMotion ? undefined : FadeInDown.delay(i * 70).duration(600)}
              style={styles.statCell}
            >
              <Card>
                <Text variant="h1" tone="accent">{s.value}</Text>
                <Text variant="caption" tone="muted" style={styles.statLabel}>{s.label}</Text>
              </Card>
            </Animated.View>
          ))}
        </View>

        <Text variant="reference" tone="muted" uppercase style={styles.sectionLabel}>
          Scripture gathered
        </Text>
        <Card>
          {sections.map((s) => (
            <Meter key={s.area} area={s.area} read={s.read} total={s.total} />
          ))}
          <View style={[styles.totalRow, { borderTopColor: t.colors.border + '88' }]}>
            <Text variant="bodySmall">Whole Bible</Text>
            <Text variant="caption" tone="accent">
              {chapterCount} of {TOTAL_CHAPTERS} chapters
            </Text>
          </View>
        </Card>

        <Text variant="reference" tone="muted" uppercase style={styles.sectionLabel}>
          The Way
        </Text>
        <Card>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Topics gathered</Text>
            <Text variant="caption" tone="muted">{completed.length} of 16</Text>
          </View>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Experience</Text>
            <Text variant="caption" tone="accent">{xp} XP</Text>
          </View>
        </Card>

        {/* Build and update state — so it is always clear which version is running. */}
        <Text variant="reference" tone="muted" uppercase style={styles.sectionLabel}>
          Treasury
        </Text>
        <Card>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Scriptures treasured</Text>
            <Text variant="caption" tone="muted">{treasuredCount(memory)}</Text>
          </View>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Ready to remember</Text>
            <Text variant="caption" tone="accent">{readyCount(memory)}</Text>
          </View>
          <Pressable
            onPress={() => { feedback.select(); router.push('/treasury'); }}
            style={[styles.checkBtn, { borderColor: t.colors.border }]}
          >
            <Text variant="bodySmall" tone="accent">Open Treasury</Text>
          </Pressable>
        </Card>

        <Text variant="reference" tone="muted" uppercase style={styles.sectionLabel}>
          Saved verses
        </Text>
        <Card>
          {savedPassageIds.length === 0 ? (
            <>
              <Text variant="h3">Nothing gathered here yet.</Text>
              <Text variant="body" tone="secondary" style={styles.empty}>
                Tap any verse while reading to keep it.
              </Text>
            </>
          ) : (
            savedPassageIds.map((ref) => (
              <View key={ref} style={styles.versionRow}>
                <Text variant="bodySmall">{ref}</Text>
              </View>
            ))
          )}
        </Card>

        <Text variant="reference" tone="muted" uppercase style={styles.sectionLabel}>
          Version
        </Text>
        <Card>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Update</Text>
            <Text variant="caption" tone="muted" style={styles.mono}>
              {shortId(Updates.updateId)}
            </Text>
          </View>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Published</Text>
            <Text variant="caption" tone="muted">{formatWhen(Updates.createdAt)}</Text>
          </View>
          <View style={styles.versionRow}>
            <Text variant="bodySmall">Channel</Text>
            <Text variant="caption" tone="muted">{Updates.channel ?? 'none'}</Text>
          </View>

          <Pressable
            onPress={checkForUpdate}
            disabled={checking}
            style={[styles.checkBtn, { borderColor: t.colors.border }]}
          >
            {checking ? (
              <ActivityIndicator size="small" color={t.colors.accent} />
            ) : (
              <>
                <RefreshCw size={15} color={t.colors.accent} strokeWidth={2} />
                <Text variant="bodySmall" tone="accent">Check for updates</Text>
              </>
            )}
          </Pressable>

          {!!updateNote && (
            <Text variant="caption" tone="muted" style={styles.updateNote}>{updateNote}</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { paddingTop: 18, gap: 16, marginBottom: 28 },
  title: {},
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCell: { flexBasis: '48%', flexGrow: 1 },
  statLabel: { marginTop: 6 },
  sectionLabel: { marginTop: 34, marginBottom: 12 },
  meter: { marginBottom: 18 },
  meterHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  track: { height: 4, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  empty: { marginTop: 8 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth, marginTop: 6, paddingTop: 14,
  },
  versionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 5,
  },
  mono: { fontVariant: ['tabular-nums'] },
  checkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, paddingVertical: 13, marginTop: 14, minHeight: 44,
  },
  updateNote: { marginTop: 10, textAlign: 'center' },
});
