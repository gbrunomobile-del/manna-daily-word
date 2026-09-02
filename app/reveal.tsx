import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { fetchChapter } from '@/services/bible';
import { getConnection } from '@/data/connections/connections';
import { useGathered } from '@/store/gathered';

interface Span { book: string; chapter: number; verseStart: number; verseEnd?: number }

const label = (r: Span) =>
  `${r.book} ${r.chapter}:${r.verseStart}` +
  (r.verseEnd && r.verseEnd !== r.verseStart ? `\u2013${r.verseEnd}` : '');

/**
 * REVEAL
 *
 * Two passages, and the thread between them. Reached from the reader when a
 * chapter has a connection — something surfacing while you read rather than a
 * feature you go and visit.
 *
 * The text is fetched rather than stored, so what is shown is the same WEB
 * wording as the reader and cannot drift from the translation it claims.
 */
export default function Reveal() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const connection = id ? getConnection(id) : undefined;
  const { gather } = useGathered();

  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!connection) { setLoading(false); return; }
    let alive = true;

    const span = async (r: Span) => {
      const verses = await fetchChapter(r.book, r.chapter, 'WEB');
      const to = r.verseEnd ?? r.verseStart;
      return verses
        .filter((v) => v.number >= r.verseStart && v.number <= to)
        .map((v) => v.text)
        .join(' ');
    };

    Promise.all([span(connection.source as Span), span(connection.target as Span)])
      .then(([a, b]) => { if (alive) { setLeft(a); setRight(b); } })
      .catch(() => { if (alive) setFailed(true); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [connection]);

  if (!connection) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
        <View style={s.centre}>
          <Text variant="body" style={{ color: t.colors.onImmersiveMuted, textAlign: 'center' }}>
            That connection could not be found.
          </Text>
          <View style={{ alignSelf: 'stretch', marginTop: 30 }}>
            <Button label="Back" variant="primary" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const sides: { ref: Span; text: string }[] = [
    { ref: connection.source as Span, text: left },
    { ref: connection.target as Span, text: right },
  ];

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
      <StatusBar style="light" />

      <View style={s.bar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: 4 }}>
          <X size={20} color={t.colors.onImmersiveMuted} strokeWidth={1.8} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={s.head}>
          <Text variant="label" uppercase style={{ color: t.colors.accent, letterSpacing: 2 }}>
            The revelation
          </Text>
          <Text variant="h1" style={[s.summary, { color: t.colors.onImmersive }]}>
            {connection.summary}
          </Text>
          <Ornament width={104} opacity={0.4} />
        </Animated.View>

        {loading ? (
          <View style={s.loading}><ActivityIndicator color={t.colors.accent} /></View>
        ) : failed ? (
          <Text variant="body" style={[s.failed, { color: t.colors.onImmersiveMuted }]}>
            The passages could not be loaded. They will be here when you are back online.
          </Text>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={s.pair}>
            {/* Older passage first, so the connection reads in the direction it
                was written — and a thread of light between the two. */}
            {sides.map((side, i) => (
              <View key={i}>
                {i === 1 && (
                  <View style={s.seamWrap}>
                    <View style={[s.seam, { backgroundColor: t.colors.accent }]} />
                  </View>
                )}
                <Text variant="reference" uppercase style={{ color: t.colors.accent }}>
                  {label(side.ref)}
                </Text>
                <Text
                  variant="scripture"
                  style={{ color: t.colors.onImmersive, marginTop: 12, lineHeight: 32 }}
                >
                  {side.text}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(420).duration(600)} style={s.teaching}>
          {connection.explanation.map((para, i) => (
            <Text
              key={i}
              variant="body"
              style={{ color: t.colors.onImmersiveMuted, lineHeight: 26, marginBottom: 16 }}
            >
              {para}
            </Text>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(560).duration(500)} style={s.cta}>
          <Button
            label="Gathered"
            variant="primary"
            arrow
            onPress={async () => {
              feedback.success?.();
              // Both passages count as met, so each shows gold in the reader.
              await gather([
                `${connection.source.book} ${connection.source.chapter}:${connection.source.verseStart}`,
                `${connection.target.book} ${connection.target.chapter}:${connection.target.verseStart}`,
              ]);
              router.back();
            }}
          />
        </Animated.View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  bar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 8 },
  content: { paddingHorizontal: 30, paddingTop: 16 },
  head: { alignItems: 'center', gap: 18 },
  summary: { textAlign: 'center', lineHeight: 38, paddingTop: 4 },
  loading: { paddingVertical: 60, alignItems: 'center' },
  failed: { textAlign: 'center', paddingVertical: 50, lineHeight: 25 },
  pair: { marginTop: 40 },
  seamWrap: { alignItems: 'center', paddingVertical: 26 },
  seam: { width: 1, height: 54, opacity: 0.8 },
  teaching: { marginTop: 44 },
  cta: { marginTop: 20 },
});
