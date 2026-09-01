import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Search, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { ScreenHeader } from '@/components/manna/ScreenHeader';
import { SCREEN_ART } from '@/components/manna/screen-art';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { BOOKS, type Book } from '@/data/books';
import { searchVerses, type VerseHit } from '@/services/bible';
import { DEFAULT_VERSION } from '@/data/versions';
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

  // Verse search runs alongside the book filter: typing “John” finds the book,
  // typing “fear not” finds the verses. Debounced so it does not fire per
  // keystroke, and only once the query is long enough to be meaningful.
  const [hits, setHits] = useState<VerseHit[]>([]);
  const [searchingText, setSearchingText] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setHits([]); return; }

    let cancelled = false;
    setSearchingText(true);
    const timer = setTimeout(() => {
      searchVerses(q, DEFAULT_VERSION)
        .then((r) => { if (!cancelled) setHits(r); })
        .catch(() => { if (!cancelled) setHits([]); })
        .finally(() => { if (!cancelled) setSearchingText(false); });
    }, 350);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

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
        <ScreenHeader
          art={SCREEN_ART.bible}
          caption="The Word"
          eyebrow="World English Bible"
          title="Read freely."
          subtitle={`${totalGathered} of ${TOTAL_CHAPTERS} chapters gathered`}
        />

        {/* Search sits on a hairline rather than in a filled pill: available,
            but not competing with the books it exists to find. */}
        <View style={[styles.search, { borderBottomColor: t.colors.border }]}>
          <Search size={16} color={t.colors.textMuted} strokeWidth={1.6} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a book, or a phrase"
            placeholderTextColor={t.colors.textMuted}
            style={[styles.input, { color: t.colors.text, fontFamily: t.fonts.sans }]}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search for a book or a phrase"
          />
        </View>

        {/* Typographic rather than a segmented control — a gold rule marks
            which testament you are in. */}
        {!searching && (
          <View style={styles.switch}>
            {(['OT', 'NT'] as Testament[]).map((key) => {
              const active = testament === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => { feedback.select(); setTestament(key); }}
                  style={styles.switchItem}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    variant="label"
                    uppercase
                    style={{
                      color: active ? t.colors.text : t.colors.textMuted,
                      fontFamily: active ? t.fonts.sansSemi : t.fonts.sans,
                    }}
                  >
                    {key === 'OT' ? 'Old Testament' : 'New Testament'}
                  </Text>
                  <View
                    style={[
                      styles.switchRule,
                      { backgroundColor: active ? t.colors.accent : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Verse results, when the query is long enough to search text. */}
        {searching && query.trim().length >= 3 && (
          <View style={styles.group}>
            <View style={styles.hitsHead}>
              <Text variant="caption" tone="muted" uppercase style={styles.groupName}>
                Verses
              </Text>
              {searchingText && <ActivityIndicator size="small" color={t.colors.accent} />}
            </View>

            {hits.map((h) => (
              <Pressable
                key={`${h.book}-${h.chapter}-${h.verse}`}
                onPress={() => {
                  feedback.select();
                  router.push(
                    `/book?name=${encodeURIComponent(h.book)}&chapter=${h.chapter}`,
                  );
                }}
                style={[styles.hit, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}
              >
                <Text variant="reference" style={{ color: t.colors.accent, marginBottom: 4 }}>
                  {h.book} {h.chapter}:{h.verse}
                </Text>
                <Text variant="body" style={{ color: t.colors.text, lineHeight: 21 }} numberOfLines={3}>
                  {h.text}
                </Text>
              </Pressable>
            ))}

            {!searchingText && hits.length === 0 && (
              <Text variant="body" tone="muted">
                No verses found for that wording. Search matches the words as
                written, so a different phrasing may find it.
              </Text>
            )}
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
              const complete = done === book.chapters;
              return (
                <Pressable
                  key={book.name}
                  onPress={() => {
                    feedback.select();
                    router.push(`/book?name=${encodeURIComponent(book.name)}`);
                  }}
                  style={[styles.book, { borderTopColor: t.colors.border }]}
                >
                  {/* A gold mark rather than a progress bar: the point is
                      whether you have been here, not a percentage. */}
                  <View
                    style={[
                      styles.mark,
                      {
                        borderColor: done > 0 ? t.colors.accent : t.colors.border,
                        backgroundColor: complete ? t.colors.accent : 'transparent',
                      },
                    ]}
                  >
                    {done > 0 && !complete && (
                      <View style={[styles.markCore, { backgroundColor: t.colors.accent }]} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyLarge"
                      style={{
                        color: t.colors.text,
                        fontFamily: complete ? t.fonts.sansSemi : t.fonts.sans,
                      }}
                    >
                      {book.name}
                    </Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                      {done > 0
                        ? `${done} of ${book.chapters} gathered`
                        : `${book.chapters} ${book.chapters === 1 ? 'chapter' : 'chapters'}`}
                    </Text>
                  </View>

                  <ChevronRight size={17} color={t.colors.textMuted} strokeWidth={1.6} />
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
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 34, minHeight: MIN_TOUCH,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  switch: { flexDirection: 'row', gap: 28, marginTop: 26 },
  switchItem: { alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  switchRule: { height: 1.5, alignSelf: 'stretch', borderRadius: 1 },
  group: { marginTop: 34 },
  groupName: { marginBottom: 4, letterSpacing: 1.2 },
  hitsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hit: { borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 8 },
  book: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 15,
    minHeight: MIN_TOUCH,
  },
  mark: {
    width: 12, height: 12, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  markCore: { width: 5, height: 5, borderRadius: 2.5 },
});
