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
import { getBook } from '@/data/books';
import { useGathered, chapterId } from '@/store/gathered';

async function fetchChapter(reference: string): Promise<string> {
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=web`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load that chapter.');
  const data = await res.json();
  return (data.text ?? '').trim();
}

export default function BookScreen() {
  const t = useTheme();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const bookName = name ?? '';
  const book = getBook(bookName);

  const { chapters, gather, hydrate, hydrated } = useGathered();
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  const isGathered = (n: number) =>
    chapters[chapterId(`${bookName} ${n}`)] !== undefined;

  const openReader = useCallback(async (n: number) => {
    feedback.select();
    setOpenChapter(n);
    setLoading(true);
    setError('');
    setText('');
    try {
      setText(await fetchChapter(`${bookName} ${n}`));
    } catch {
      setError('Could not load that chapter. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [bookName]);

  const markGathered = useCallback(async () => {
    if (openChapter === null) return;
    feedback.success?.();
    await gather(`${bookName} ${openChapter}`);
  }, [openChapter, bookName, gather]);

  if (!book) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]}>
        <View style={styles.centre}>
          <Text variant="body" tone="muted">That book was not found.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Reader ─────────────────────────────────────────────────────────────────
  if (openChapter !== null) {
    const alreadyGathered = isGathered(openChapter);
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: t.colors.border + '44' }]}>
          <Pressable onPress={() => setOpenChapter(null)} hitSlop={10} style={styles.back}>
            <ChevronLeft size={22} color={t.colors.textMuted} strokeWidth={1.8} />
          </Pressable>
          <Text variant="body" style={{ color: t.colors.text, fontFamily: t.fonts.sansSemi }}>
            {book.name} {openChapter}
          </Text>
        </View>

        {loading ? (
          <View style={styles.centre}><ActivityIndicator color={t.colors.accent} /></View>
        ) : error ? (
          <View style={styles.centre}>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.readerContent} showsVerticalScrollIndicator={false}>
            {alreadyGathered && (
              <View style={[styles.gatheredBanner, { backgroundColor: t.colors.accent + '15', borderColor: t.colors.accent + '38' }]}>
                <Check size={13} color={t.colors.accent} strokeWidth={2.2} />
                <Text variant="caption" style={{ color: t.colors.accent, letterSpacing: 0.6 }}>
                  You have gathered this chapter before
                </Text>
              </View>
            )}

            <Text
              variant="scripture"
              style={{ color: t.colors.text, fontStyle: alreadyGathered ? 'italic' : 'normal' }}
            >
              {text}
            </Text>

            <View style={{ height: 24 }} />
            {!alreadyGathered && (
              <Button label="Mark as gathered" variant="primary" onPress={markGathered} />
            )}
            <View style={{ height: 48 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // ── Chapter picker ─────────────────────────────────────────────────────────
  const gatheredCount = Array.from({ length: book.chapters }, (_, i) => i + 1).filter(isGathered).length;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: t.colors.border + '44' }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={22} color={t.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted" uppercase>{book.group}</Text>
          <Text variant="body" style={{ color: t.colors.text, fontFamily: t.fonts.sansSemi }}>
            {book.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.pickerContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(350)}>
          <Text variant="body" tone="muted">
            {gatheredCount} of {book.chapters} chapters gathered
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.chapterGrid}>
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => {
            const done = isGathered(n);
            return (
              <Pressable
                key={n}
                onPress={() => openReader(n)}
                style={[
                  styles.chapter,
                  {
                    backgroundColor: done ? t.colors.accent : t.colors.surface,
                    borderColor: done ? t.colors.accent : t.colors.border,
                  },
                ]}
              >
                <Text
                  variant="body"
                  style={{
                    color: done ? t.colors.background : t.colors.text,
                    fontFamily: done ? t.fonts.sansSemi : t.fonts.sans,
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  pickerContent: { paddingHorizontal: 24, paddingTop: 20 },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 18 },
  chapter: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  readerContent: { paddingHorizontal: 24, paddingTop: 20 },
  gatheredBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 9, marginBottom: 20,
  },
});
