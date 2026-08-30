import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Search } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { BOOKS, type Book } from '@/data/books';
import { useGathered, chapterId, TOTAL_CHAPTERS } from '@/store/gathered';

type Testament = 'OT' | 'NT';

export default function Bible() {
  const t = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [testament, setTestament] = useState<Testament>('OT');
  const { chapters, hydrate, hydrated } = useGathered();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  /** How many chapters of this book have been gathered. */
  const gatheredIn = (book: Book) => {
    let n = 0;
    for (let c = 1; c <= book.chapters; c++) {
      if (chapters[chapterId(`${book.name} ${c}`)] !== undefined) n++;
    }
    return n;
  };

  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    if (searching) {
      const q = query.trim().toLowerCase();
      return BOOKS.filter((b) => b.name.toLowerCase().includes(q));
    }
    return BOOKS.filter((b) => b.testament === testament);
  }, [query, testament, searching]);

  const grouped = useMemo(() => {
    const map = new Map<string, Book[]>();
    for (const b of visible) {
      const list = map.get(b.group) ?? [];
      list.push(b);
      map.set(b.group, list);
    }
    return Array.from(map.entries());
  }, [visible]);

  const totalGathered = Object.keys(chapters).length;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text variant="caption" tone="muted" uppercase>World English Bible</Text>
          <Text variant="hero" style={{ color: t.colors.text, marginTop: 6 }}>
            Read freely
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: 6 }}>
            {totalGathered} of {TOTAL_CHAPTERS} chapters gathered
          </Text>
        </Animated.View>

        <View style={[styles.search, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
          <Search size={17} color={t.colors.textMuted} strokeWidth={1.7} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a book"
            placeholderTextColor={t.colors.textMuted}
            style={[styles.input, { color: t.colors.text, fontFamily: t.fonts.sans }]}
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Search for a book"
          />
        </View>

        {!searching && (
          <View style={[styles.switch, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
            {(['OT', 'NT'] as Testament[]).map((key) => {
              const active = testament === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => { feedback.select(); setTestament(key); }}
                  style={[styles.switchItem, active && { backgroundColor: t.colors.accent }]}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: active ? t.colors.background : t.colors.textMuted,
                      fontFamily: active ? t.fonts.sansSemi : t.fonts.sans,
                      letterSpacing: 0.6,
                    }}
                  >
                    {key === 'OT' ? 'Old Testament' : 'New Testament'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {grouped.map(([group, books], gi) => (
          <Animated.View
            key={`${testament}-${group}`}
            entering={FadeInDown.delay(gi * 45).duration(380)}
            style={styles.group}
          >
            <Text variant="caption" tone="muted" uppercase style={styles.groupName}>
              {group}
            </Text>

            {books.map((book) => {
              const done = gatheredIn(book);
              const pct = done / book.chapters;
              const complete = done === book.chapters;
              return (
                <Pressable
                  key={book.name}
                  onPress={() => {
                    feedback.select();
                    router.push(`/book?name=${encodeURIComponent(book.name)}`);
                  }}
                  style={[
                    styles.book,
                    {
                      backgroundColor: done > 0 ? t.colors.accent + '0C' : 'transparent',
                      borderColor: done > 0 ? t.colors.accent + '30' : t.colors.border + '77',
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="body"
                      style={{
                        color: t.colors.text,
                        fontFamily: complete ? t.fonts.sansSemi : t.fonts.sans,
                      }}
                    >
                      {book.name}
                    </Text>
                    <View style={[styles.track, { backgroundColor: t.colors.border + '55' }]}>
                      <View
                        style={[
                          styles.trackFill,
                          { backgroundColor: t.colors.accent, width: `${Math.round(pct * 100)}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <Text variant="caption" tone="muted" style={styles.count}>
                    {done}/{book.chapters}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>
        ))}

        {grouped.length === 0 && (
          <Text variant="body" tone="muted" style={{ marginTop: 32, textAlign: 'center' }}>
            No book by that name.
          </Text>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 16, marginTop: 20, minHeight: MIN_TOUCH,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  switch: { flexDirection: 'row', borderWidth: 1, borderRadius: 999, padding: 3, marginTop: 12 },
  switchItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 999 },
  group: { marginTop: 26 },
  groupName: { marginBottom: 10, letterSpacing: 1 },
  book: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13, marginBottom: 8,
    minHeight: MIN_TOUCH,
  },
  track: { height: 3, borderRadius: 2, marginTop: 7, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 2 },
  count: { fontVariant: ['tabular-nums'] },
});
