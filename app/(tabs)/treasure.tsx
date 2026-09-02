import React, { useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { PaperGrain } from '@/components/primitives/Screen';
import { EngravedLamp } from '@/components/manna/LampIndicator';
import { LAMP_ART } from '@/components/manna/screen-art';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import {
  useTreasure, treasuredCount, learningCount, readyCount, type SessionLength,
} from '@/store/treasure';

const LENGTHS: { value: SessionLength; label: string }[] = [
  { value: 5, label: 'Quick' },
  { value: 10, label: 'Daily' },
  { value: 20, label: 'Deep' },
];

/**
 * TREASURE — home.
 *
 * The counts are the only mechanics shown. Everything about scheduling,
 * strength and intervals stays underneath; what the reader sees is how much
 * they have kept and how much is waiting.
 */
export default function TreasureHome() {
  const t = useTheme();
  const router = useRouter();
  const { items, sessionLength, setSessionLength, hydrate, hydrated } = useTreasure();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  const treasured = treasuredCount(items);
  const learning = learningCount(items);
  const ready = readyCount(items);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <PaperGrain />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.lamp}>
          <EngravedLamp lamp={LAMP_ART.lamp} flame={LAMP_ART.flame} size={190} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(560)} style={styles.head}>
          <Text variant="label" tone="muted" uppercase>Scripture memory</Text>
          <Text variant="hero" style={[styles.title, { color: t.colors.text }]}>
            Treasure the Word.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(560)} style={styles.psalm}>
          <Ornament width={104} opacity={0.4} />
          <Text
            variant="scripture"
            style={[styles.psalmText, { color: t.colors.textSecondary, fontFamily: t.fonts.serifItalic }]}
          >
            I have hidden your word in my heart.
          </Text>
          <Text variant="reference" uppercase style={{ color: t.colors.accent, marginTop: 14 }}>
            Psalm 119:11
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).duration(520)} style={styles.counts}>
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
            <Text variant="caption" tone="muted" style={styles.countLabel}>
              ready to remember
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(480).duration(520)} style={styles.cta}>
          <Button
            label="Begin"
            variant="primary"
            arrow
            onPress={() => {
              feedback.select();
              router.push('/treasure-session');
            }}
          />

          {/* Session length is a quiet preference, not a gate before every visit. */}
          <View style={styles.lengths}>
            {LENGTHS.map((l) => {
              const active = l.value === sessionLength;
              return (
                <Pressable
                  key={l.value}
                  onPress={() => { feedback.select(); void setSessionLength(l.value); }}
                  style={styles.length}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: active ? t.colors.text : t.colors.textMuted,
                      fontFamily: active ? t.fonts.sansSemi : t.fonts.sans,
                    }}
                  >
                    {l.label} · {l.value}
                  </Text>
                  <View
                    style={[
                      styles.lengthRule,
                      { backgroundColor: active ? t.colors.accent : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(580).duration(520)}>
          <Pressable
            onPress={() => { feedback.select(); router.push('/treasury'); }}
            style={[styles.treasury, { borderTopColor: t.colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ color: t.colors.text }}>Your Treasury</Text>
              <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                {learning > 0 ? `${learning} being learned` : 'Nothing yet in progress'}
              </Text>
            </View>
            <Text variant="label" uppercase style={{ color: t.colors.accent }}>Open</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 6 },
  back: { padding: 6 },
  content: { paddingHorizontal: 32, paddingTop: 28 },
  lamp: { alignItems: 'center' },
  head: { alignItems: 'center', marginTop: 18 },
  title: { textAlign: 'center', marginTop: 8 },
  psalm: { alignItems: 'center', marginTop: 34 },
  psalmText: { textAlign: 'center', marginTop: 20, lineHeight: 32 },
  counts: { flexDirection: 'row', alignItems: 'center', marginTop: 46 },
  count: { flex: 1, alignItems: 'center' },
  countLabel: { marginTop: 4, textAlign: 'center' },
  rule: { width: StyleSheet.hairlineWidth, height: 44 },
  cta: { marginTop: 46 },
  lengths: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 22 },
  length: { alignItems: 'center', gap: 6, paddingVertical: 6 },
  lengthRule: { height: 1.5, width: 20, borderRadius: 1 },
  treasury: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 46, paddingTop: 20, minHeight: MIN_TOUCH,
  },
});
