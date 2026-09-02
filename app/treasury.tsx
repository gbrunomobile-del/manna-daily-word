import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { formatRef } from '@/types/scripture';
import { isDue, type MemoryItem } from '@/services/memory';
import { useTreasure, treasuredCount, readyCount } from '@/store/treasure';

type Filter = 'all' | 'learning' | 'treasured' | 'ready';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'learning', label: 'Learning' },
  { key: 'treasured', label: 'Treasured' },
  { key: 'ready', label: 'Ready' },
];

/** Milestones at which the Treasury grows visibly brighter. */
const MILESTONES = [10, 25, 50, 100, 250, 500];

/**
 * YOUR TREASURY
 *
 * What has been kept, and what is on the way there. No progress bar per verse:
 * a verse is either being learned or it is yours, and a percentage on each row
 * would turn Scripture into a set of tasks.
 *
 * The illumination is milestone-based for now. The larger idea — an engraving
 * that lights gradually as the collection grows — sits behind this same shape
 * and can replace the ornament without disturbing anything else.
 */
export default function Treasury() {
  const t = useTheme();
  const router = useRouter();
  const { items, hydrate, hydrated } = useTreasure();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  const treasured = treasuredCount(items);
  const ready = readyCount(items);

  const shown = useMemo(() => {
    const met = items.filter((i) => i.state !== 'new');
    switch (filter) {
      case 'learning':
        return met.filter((i) => i.state === 'learning' || i.state === 'remembering');
      case 'treasured':
        return met.filter((i) => i.state === 'treasured');
      case 'ready':
        return met.filter((i) => isDue(i));
      default:
        return met;
    }
  }, [items, filter]);

  /** How lit the ornament is, by how much has been kept. */
  const reached = MILESTONES.filter((m) => treasured >= m).length;
  const glow = 0.3 + reached * 0.12;

  const stateLabel = (i: MemoryItem) =>
    i.state === 'treasured' ? 'Treasured'
    : isDue(i) ? 'Ready to remember'
    : 'Learning';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={22} color={t.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.head}>
          <Ornament width={132} opacity={Math.min(glow, 1)} />
          <Text variant="label" tone="muted" uppercase style={{ marginTop: 22 }}>
            Your Treasury
          </Text>
          <Text variant="hero" style={[styles.title, { color: t.colors.text }]}>
            Kept in the heart.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(480)} style={styles.counts}>
          <View style={styles.count}>
            <Text variant="h1" style={{ color: t.colors.text }}>{treasured}</Text>
            <Text variant="caption" tone="muted" style={styles.countLabel}>
              {treasured === 1 ? 'Scripture treasured' : 'Scriptures treasured'}
            </Text>
          </View>
          <View style={[styles.rule, { backgroundColor: t.colors.border }]} />
          <View style={styles.count}>
            <Text variant="h1" style={{ color: ready > 0 ? t.colors.accent : t.colors.text }}>
              {ready}
            </Text>
            <Text variant="caption" tone="muted" style={styles.countLabel}>ready to remember</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(480)} style={styles.filters}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => { feedback.select(); setFilter(f.key); }}
                style={styles.filter}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text
                  variant="caption"
                  uppercase
                  style={{
                    color: active ? t.colors.text : t.colors.textMuted,
                    fontFamily: active ? t.fonts.sansSemi : t.fonts.sans,
                    letterSpacing: 1,
                  }}
                >
                  {f.label}
                </Text>
                <View
                  style={[
                    styles.filterRule,
                    { backgroundColor: active ? t.colors.accent : 'transparent' },
                  ]}
                />
              </Pressable>
            );
          })}
        </Animated.View>

        {shown.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="body" tone="muted" style={{ textAlign: 'center', lineHeight: 24 }}>
              {items.some((i) => i.state !== 'new')
                ? 'Nothing here under that filter yet.'
                : 'Nothing kept yet. Begin a session and the first Scripture will appear here.'}
            </Text>
          </View>
        ) : (
          shown.map((i, n) => (
            <Animated.View key={i.id} entering={FadeInDown.delay(Math.min(n, 8) * 40).duration(400)}>
              <Pressable
                onPress={() => {
                  feedback.select();
                  router.push(`/treasure-session?verse=${encodeURIComponent(i.id)}`);
                }}
                style={[styles.item, { borderTopColor: t.colors.border }]}
              >
                <View style={styles.itemHead}>
                  <Text variant="reference" uppercase style={{ color: t.colors.accent }}>
                    {formatRef(i.ref)}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: i.state === 'treasured' ? t.colors.accent : t.colors.textMuted,
                    }}
                  >
                    {stateLabel(i)}
                  </Text>
                </View>

                <Text
                  variant="scripture"
                  style={{ color: t.colors.text, marginTop: 8, lineHeight: 27 }}
                  numberOfLines={2}
                >
                  {i.text}
                </Text>
              </Pressable>
            </Animated.View>
          ))
        )}

        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 6 },
  back: { padding: 6 },
  content: { paddingHorizontal: 26, paddingTop: 10 },
  head: { alignItems: 'center' },
  title: { textAlign: 'center', marginTop: 8 },
  counts: { flexDirection: 'row', alignItems: 'center', marginTop: 40 },
  count: { flex: 1, alignItems: 'center' },
  countLabel: { marginTop: 4, textAlign: 'center' },
  rule: { width: StyleSheet.hairlineWidth, height: 44 },
  filters: { flexDirection: 'row', gap: 22, marginTop: 42 },
  filter: { alignItems: 'flex-start', gap: 7, paddingVertical: 4 },
  filterRule: { height: 1.5, alignSelf: 'stretch', borderRadius: 1 },
  empty: { paddingVertical: 56, paddingHorizontal: 20 },
  item: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18, minHeight: MIN_TOUCH,
  },
  itemHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
