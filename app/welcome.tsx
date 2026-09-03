import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';

/** Set once the walkthrough has been seen, so it never interrupts again. */
export const WELCOME_KEY = 'manna.welcomed';

interface Page {
  eyebrow: string;
  title: string;
  body: string;
  /** What the mode actually asks of you, in the app's own words. */
  detail?: string[];
}

/**
 * WELCOME
 *
 * Shown once. It explains the four places you can spend time and what the
 * memory exercises actually ask — not because the app is complicated, but
 * because several of its modes are unfamiliar enough that meeting them cold is
 * a worse first impression than they deserve.
 *
 * Skippable from the first page. Nobody should be made to read an explanation
 * of an app they have not used yet.
 */
const PAGES: Page[] = [
  {
    eyebrow: 'Welcome',
    title: 'Gather truth. Daily.',
    body: 'Manna is a place to read Scripture, learn its story, and keep it. Four things, and none of them ask much of a day.',
  },
  {
    eyebrow: 'Today',
    title: 'Your portion.',
    body: 'Four passages each day — Old Testament, New Testament, a psalm and a proverb — which take you through the whole Bible in a year.',
    detail: [
      'Read them in any order, and gather each as you go.',
      'Where a chapter has questions, they appear beneath it.',
      'Miss a day and nothing is lost. Step back and pick it up.',
    ],
  },
  {
    eyebrow: 'The Way',
    title: 'Learn the story.',
    body: 'Sixteen topics from Creation to Revelation, each with questions that ask what a passage means rather than what it lists.',
    detail: [
      'Choose an answer, and the reason follows.',
      'Three lamps. A wrong answer dims one.',
      'Verses you meet here are marked in the Bible afterwards.',
    ],
  },
  {
    eyebrow: 'Treasure',
    title: 'Keep the Word.',
    body: 'Scripture memory, one verse at a time. A verse shows less of itself the better you know it, until only the reference is left.',
    detail: [
      'Read — meet the verse with nothing asked of you.',
      'Missing word — choose the words that have gone.',
      'Build the verse — put its phrases back in order.',
      'Match — pair three Scriptures with their references.',
      'Recall — fill the gaps from memory, a hint at a time.',
      'Whisper — the reference alone. Say it aloud, then reveal.',
    ],
  },
  {
    eyebrow: 'The Bible',
    title: 'Read freely.',
    body: 'The whole Bible in five translations, with no plan and no schedule. Tap any verse to keep it.',
    detail: [
      'Chapters you have gathered are marked in gold.',
      'Where two passages speak to each other, a connection appears.',
    ],
  },
];

export default function Welcome() {
  const t = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem(WELCOME_KEY, '1');
    router.replace('/(tabs)/today');
  };

  const p = PAGES[page];
  const last = page === PAGES.length - 1;

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
      <StatusBar style="light" />

      <View style={s.top}>
        <Pressable onPress={finish} hitSlop={12} style={s.skip}>
          <Text variant="caption" style={{ color: t.colors.onImmersiveMuted }}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View key={page} entering={FadeIn.duration(420)} style={s.block}>
          <Text variant="label" uppercase style={{ color: t.colors.accent, letterSpacing: 2 }}>
            {p.eyebrow}
          </Text>
          <Text variant="hero" style={[s.title, { color: t.colors.onImmersive }]}>
            {p.title}
          </Text>
          <Ornament width={100} opacity={0.4} />
          <Text variant="bodyLarge" style={[s.body, { color: t.colors.onImmersiveMuted }]}>
            {p.body}
          </Text>

          {p.detail && (
            <View style={s.detail}>
              {p.detail.map((d, i) => (
                <Animated.View
                  key={d}
                  entering={FadeInDown.delay(120 + i * 70).duration(380)}
                  style={s.detailRow}
                >
                  <View style={[s.dot, { backgroundColor: t.colors.accent }]} />
                  <Text variant="body" style={{ color: t.colors.onImmersive, flex: 1, lineHeight: 24 }}>
                    {d}
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={s.foot}>
        <View style={s.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                s.pageDot,
                {
                  backgroundColor: i === page ? t.colors.accent : 'transparent',
                  borderColor: i === page ? t.colors.accent : 'rgba(245,239,227,0.3)',
                  width: i === page ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>

        <Button
          label={last ? 'Begin' : 'Next'}
          variant="primary"
          arrow
          onPress={() => {
            feedback.select();
            if (last) void finish(); else setPage((n) => n + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 22, paddingTop: 8 },
  skip: { padding: 10, minHeight: MIN_TOUCH, justifyContent: 'center' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 20 },
  block: { alignItems: 'center', gap: 18 },
  title: { textAlign: 'center', lineHeight: 46, paddingTop: 4 },
  body: { textAlign: 'center', lineHeight: 27 },
  detail: { alignSelf: 'stretch', marginTop: 16, gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  foot: { paddingHorizontal: 32, paddingBottom: 24, gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  pageDot: { height: 6, borderRadius: 3, borderWidth: 1 },
});
