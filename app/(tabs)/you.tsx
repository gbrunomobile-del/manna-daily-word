import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { MannaMark } from '@/components/manna/MannaMark';
import { useTheme } from '@/theme';
import { useProgress } from '@/store/progress';

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
});
