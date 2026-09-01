import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RefreshCw } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { MannaMark } from '@/components/manna/MannaMark';
import { useTheme } from '@/theme';
import { useProgress } from '@/store/progress';
import { feedback } from '@/services/feedback';

/** Short form of the running update id — enough to match against eas update:list. */
const shortId = (id: string | null) => (id ? id.slice(0, 8) : 'embedded');

const formatWhen = (d: Date | null) => {
  if (!d) return 'shipped with the build';
  return d.toLocaleString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const KNOWLEDGE = [
  { area: 'Old Testament', value: 0.72 },
  { area: 'Jesus', value: 0.91 },
  { area: 'Paul', value: 0.58 },
  { area: 'Prophecy', value: 0.36 },
  { area: 'Biblical context', value: 0.68 },
] as const;

const Meter = ({ area, value }: { area: string; value: number }) => {
  const t = useTheme();
  return (
    <View style={styles.meter}>
      <View style={styles.meterHead}>
        <Text variant="bodySmall">{area}</Text>
        <Text variant="caption" tone="muted">{Math.round(value * 100)}%</Text>
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
  const { daysGathered, totalSeconds, completedLessonIds, savedPassageIds } = useProgress();
  const minutes = Math.round(totalSeconds / 60);

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
    { label: 'Minutes in the Word', value: String(minutes) },
    { label: 'Lessons', value: String(completedLessonIds.length) },
    { label: 'Saved', value: String(savedPassageIds.length) },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
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
          Knowledge areas
        </Text>
        <Card>
          {KNOWLEDGE.map((k) => <Meter key={k.area} area={k.area} value={k.value} />)}
        </Card>

        {savedPassageIds.length === 0 ? (
          <>
            <Text variant="reference" tone="muted" uppercase style={styles.sectionLabel}>
              Saved verses
            </Text>
            <Card>
              <Text variant="h3">Nothing gathered here yet.</Text>
              <Text variant="body" tone="secondary" style={styles.empty}>
                When a passage speaks to you, save it and return here.
              </Text>
            </Card>
          </>
        ) : null}

        {/* Build and update state — so it is always clear which version is running. */}
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
