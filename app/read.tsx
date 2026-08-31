import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Check } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { getDayReading, passagesForDay } from '@/data/year-plan';
import { useGathered } from '@/store/gathered';
import { useProgress } from '@/store/progress';

interface Passage {
  reference: string;
  text: string;
  label: string;
  alreadyGathered: boolean;
}

const LABELS = ['Old Testament', 'New Testament', 'Psalm', 'Proverb'];

async function fetchPassage(reference: string): Promise<string> {
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=web`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${reference}`);
  const data = await res.json();
  return (data.text ?? '').trim();
}

export default function DailyReading() {
  const t = useTheme();
  const router = useRouter();
  const { day: dayParam } = useLocalSearchParams<{ day: string }>();
  const day = Number(dayParam) || 1;

  const reading = getDayReading(day);
  const { gather, hasGathered, hydrate, hydrated } = useGathered();
  const recordDay = useProgress((s) => s.gather);

  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  useEffect(() => {
    if (!reading) { setLoading(false); setError('That day is not in the plan.'); return; }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      const refs = passagesForDay(day);
      try {
        const results = await Promise.all(
          refs.map(async (ref, i) => {
            const alreadyGathered = hasGathered(ref);
            try {
              const text = await fetchPassage(ref);
              return { reference: ref, text, label: LABELS[i] ?? '', alreadyGathered };
            } catch {
              return { reference: ref, text: '', label: LABELS[i] ?? '', alreadyGathered };
            }
          }),
        );
        if (!cancelled) setPassages(results);
      } catch {
        if (!cancelled) setError('Could not load this reading. Check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [day, reading, hasGathered]);

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
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]}>
        <View style={styles.centre}>
          <Animated.View entering={FadeInDown.duration(700)} style={{ alignItems: 'center', gap: 22 }}>
            <View style={[styles.vessel, { borderColor: t.colors.accent }]}>
              <Check size={30} color={t.colors.accent} strokeWidth={2} />
            </View>
            <Text variant="title" style={{ color: t.colors.text, textAlign: 'center' }}>
              Gathered.
            </Text>
            <Text variant="body" tone="muted" style={{ textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 }}>
              Day {day} is complete. These chapters are part of your journey now — you will see them lit wherever they appear again.
            </Text>
            <Button label="Return" variant="primary" onPress={() => router.back()} />
          </Animated.View>
        </View>
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
            Today&apos;s portion
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator color={t.colors.accent} />
          <Text variant="caption" tone="muted" style={{ marginTop: 12 }}>Gathering the Word…</Text>
        </View>
      ) : error ? (
        <View style={styles.centre}>
          <Text variant="body" tone="muted" style={{ textAlign: 'center', paddingHorizontal: 32 }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {passages.map((p, i) => (
            <Animated.View
              key={p.reference}
              entering={FadeIn.delay(i * 90).duration(420)}
              style={[
                styles.passage,
                {
                  backgroundColor: p.alreadyGathered ? t.colors.accent + '0E' : t.colors.surface,
                  borderColor: p.alreadyGathered ? t.colors.accent + '38' : t.colors.border,
                },
              ]}
            >
              <View style={styles.passageHead}>
                <Text variant="caption" tone="muted" uppercase>{p.label}</Text>
                {p.alreadyGathered && (
                  <View style={[styles.gatheredPill, { backgroundColor: t.colors.accent + '20' }]}>
                    <Text style={{ color: t.colors.accent, fontSize: 10, letterSpacing: 0.6 }}>
                      GATHERED
                    </Text>
                  </View>
                )}
              </View>

              <Text variant="reference" style={{ color: t.colors.accent, marginTop: 4, marginBottom: 12 }}>
                {p.reference}
              </Text>

              {p.text ? (
                <Text
                  variant="scripture"
                  style={{
                    color: t.colors.text,
                    fontStyle: p.alreadyGathered ? 'italic' : 'normal',
                  }}
                >
                  {p.text}
                </Text>
              ) : (
                <Text variant="body" tone="muted">
                  This passage could not be loaded. You can still mark the day as gathered.
                </Text>
              )}
            </Animated.View>
          ))}

          <View style={{ height: 20 }} />
          <Button label="Mark as gathered" variant="primary" onPress={handleComplete} />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { padding: 4 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  passage: { borderWidth: 1, borderRadius: 18, padding: 20, marginBottom: 16 },
  passageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gatheredPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  vessel: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
});
