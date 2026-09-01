import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Modal,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft, ChevronRight, Check, Type, X, Bookmark, HelpCircle,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { getBook } from '@/data/books';
import { VERSIONS, DEFAULT_VERSION, getVersion } from '@/data/versions';
import { fetchChapter, type Verse } from '@/services/bible';
import { useGathered, chapterId } from '@/store/gathered';
import { useProgress, useTimeInWord } from '@/store/progress';
import { hasChapterQuestions } from '@/data/way-questions';

/** Reading sizes, in points. Stored so the choice persists. */
const SIZES = [17, 19, 21, 24] as const;
const SIZE_KEY = 'manna.readerSize';
const VERSION_KEY = 'manna.version';

export default function BookScreen() {
  const t = useTheme();
  const router = useRouter();
  const { name, chapter: chapterParam } = useLocalSearchParams<{ name: string; chapter?: string }>();
  const bookName = name ?? '';
  const book = getBook(bookName);

  const { chapters, gather, hydrate, hydrated } = useGathered();
  const savedPassageIds = useProgress((p) => p.savedPassageIds);
  const toggleSaved = useProgress((p) => p.toggleSaved);

  /** The verse a reader has tapped, if any — opens the actions sheet. */
  const [selected, setSelected] = useState<Verse | null>(null);

  // Reading a chapter is time in the Word.
  useTimeInWord();

  const [openChapter, setOpenChapter] = useState<number | null>(
    chapterParam ? Number(chapterParam) : null,
  );
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [showVersions, setShowVersions] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  // Restore reading preferences.
  useEffect(() => {
    void AsyncStorage.multiGet([VERSION_KEY, SIZE_KEY]).then((pairs) => {
      const map = Object.fromEntries(pairs);
      if (map[VERSION_KEY]) setVersion(map[VERSION_KEY]);
      if (map[SIZE_KEY]) {
        const i = SIZES.indexOf(Number(map[SIZE_KEY]) as typeof SIZES[number]);
        if (i >= 0) setSizeIdx(i);
      }
    });
  }, []);

  const isGathered = useCallback(
    (n: number) => chapters[chapterId(`${bookName} ${n}`)] !== undefined,
    [chapters, bookName],
  );

  /**
   * Whether this exact verse has been met in a lesson.
   *
   * Lessons gather the verses they teach as verse-level keys, so this asks what
   * the reader has actually encountered — not merely which verses the question
   * bank happens to contain.
   */
  const wasTaught = useCallback(
    (n: number, verse: number) =>
      chapters[chapterId(`${bookName} ${n}:${verse}`)] !== undefined,
    [chapters, bookName],
  );

  const load = useCallback(async (n: number, v: string) => {
    setLoading(true);
    setError('');
    try {
      setVerses(await fetchChapter(bookName, n, v));
    } catch {
      setError('Could not load that chapter. Check your connection.');
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [bookName]);

  useEffect(() => {
    if (openChapter !== null) void load(openChapter, version);
  }, [openChapter, version, load]);

  const changeVersion = useCallback(async (id: string) => {
    feedback.select();
    setVersion(id);
    setShowVersions(false);
    await AsyncStorage.setItem(VERSION_KEY, id);
  }, []);

  const changeSize = useCallback(async (i: number) => {
    feedback.select();
    setSizeIdx(i);
    await AsyncStorage.setItem(SIZE_KEY, String(SIZES[i]));
  }, []);

  const markGathered = useCallback(async () => {
    if (openChapter === null) return;
    feedback.success?.();
    await gather(`${bookName} ${openChapter}`);
  }, [openChapter, bookName, gather]);

  const gatheredCount = useMemo(() => {
    if (!book) return 0;
    let n = 0;
    for (let c = 1; c <= book.chapters; c++) if (isGathered(c)) n++;
    return n;
  }, [book, isGathered]);

  if (!book) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.background }]}>
        <View style={s.centre}>
          <Text variant="body" tone="muted">That book was not found.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Reader ─────────────────────────────────────────────────────────────────
  if (openChapter !== null) {
    const already = isGathered(openChapter);
    const size = SIZES[sizeIdx];
    const v = getVersion(version);

    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
        {/* Reader bar */}
        <View style={[s.bar, { borderBottomColor: t.colors.border + '44' }]}>
          <Pressable onPress={() => setOpenChapter(null)} hitSlop={10} style={s.iconBtn}>
            <ChevronLeft size={22} color={t.colors.textMuted} strokeWidth={1.8} />
          </Pressable>

          <Pressable
            onPress={() => { feedback.select(); setShowVersions(true); }}
            style={[s.pill, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}
          >
            <Text variant="body" style={{ color: t.colors.text, fontFamily: t.fonts.sansSemi }}>
              {book.name} {openChapter}
            </Text>
            <View style={[s.divider, { backgroundColor: t.colors.border }]} />
            <Text variant="caption" style={{ color: t.colors.accent, fontFamily: t.fonts.sansSemi }}>
              {v.short}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => { feedback.select(); setShowSizes((x) => !x); }}
            hitSlop={10}
            style={s.iconBtn}
          >
            <Type size={19} color={t.colors.textMuted} strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Text size row */}
        {showSizes && (
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[s.sizeRow, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.border + '44' }]}
          >
            {SIZES.map((px, i) => (
              <Pressable
                key={px}
                onPress={() => changeSize(i)}
                style={[
                  s.sizeBtn,
                  i === sizeIdx && { backgroundColor: t.colors.accent + '22', borderColor: t.colors.accent },
                  i !== sizeIdx && { borderColor: t.colors.border },
                ]}
              >
                <Text style={{ fontSize: 11 + i * 3, color: t.colors.text }}>A</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {loading ? (
          <View style={s.centre}><ActivityIndicator color={t.colors.accent} /></View>
        ) : error ? (
          <View style={s.centre}>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.reader} showsVerticalScrollIndicator={false}>
            {already && (
              <View style={[s.banner, { backgroundColor: t.colors.accent + '14', borderColor: t.colors.accent + '38' }]}>
                <Check size={13} color={t.colors.accent} strokeWidth={2.2} />
                <Text variant="caption" style={{ color: t.colors.accent }}>
                  Gathered
                </Text>
              </View>
            )}

            <Text variant="hero" style={{ color: t.colors.text, marginBottom: 4 }}>
              {book.name} {openChapter}
            </Text>
            <Text variant="caption" tone="muted" style={{ marginBottom: 22 }}>
              {v.name}
            </Text>

            {/*
              The chapter reads as prose, not a list. Verse numbers sit inline
              and small so they mark the text without interrupting it — a row
              per verse turned Scripture into a table.
            */}
            <Text
              variant="scripture"
              style={{ color: t.colors.text, fontSize: size, lineHeight: size * 1.74 }}
            >
              {verses.map((verse) => {
                const taught = wasTaught(openChapter, verse.number);
                return (
                  <RNText key={verse.number}>
                    <RNText
                      style={{
                        color: taught ? t.colors.accent : t.colors.textMuted,
                        fontFamily: t.fonts.sansSemi,
                        fontSize: Math.round(size * 0.56),
                      }}
                    >
                      {verse.number}  
                    </RNText>
                    {/* Verses met in a lesson carry a faint gold ground —
                        over time the page fills in with what you have learned. */}
                    <RNText
                      onPress={() => { feedback.select(); setSelected(verse); }}
                      style={taught ? { backgroundColor: t.colors.illumination } : undefined}
                    >
                      {verse.text}
                    </RNText>
                    {'  '}
                  </RNText>
                );
              })}
            </Text>

            {!already && (
              <View style={{ marginTop: 28 }}>
                <Button label="Mark as gathered" variant="primary" onPress={markGathered} />
              </View>
            )}

            {/* Chapter navigation */}
            <View style={s.navRow}>
              <Pressable
                disabled={openChapter <= 1}
                onPress={() => { feedback.select(); setOpenChapter(openChapter - 1); }}
                style={[s.navBtn, { borderColor: t.colors.border, opacity: openChapter <= 1 ? 0.35 : 1 }]}
              >
                <ChevronLeft size={17} color={t.colors.text} strokeWidth={2} />
                <Text variant="caption" style={{ color: t.colors.text }}>Previous</Text>
              </Pressable>

              <Pressable
                disabled={openChapter >= book.chapters}
                onPress={() => { feedback.select(); setOpenChapter(openChapter + 1); }}
                style={[s.navBtn, { borderColor: t.colors.border, opacity: openChapter >= book.chapters ? 0.35 : 1 }]}
              >
                <Text variant="caption" style={{ color: t.colors.text }}>Next</Text>
                <ChevronRight size={17} color={t.colors.text} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* Verse actions */}
        <Modal
          visible={selected !== null}
          animationType="slide"
          transparent
          onRequestClose={() => setSelected(null)}
        >
          <Pressable style={s.backdrop} onPress={() => setSelected(null)} />
          <View style={[s.sheet, { backgroundColor: t.colors.background, borderColor: t.colors.border }]}>
            {selected && (() => {
              const ref = `${book.name} ${openChapter}:${selected.number}`;
              const saved = savedPassageIds.includes(ref);
              const chapterKey = chapterId(`${book.name} ${openChapter}`);
              return (
                <>
                  <View style={s.sheetHead}>
                    <Text variant="reference" uppercase style={{ color: t.colors.accent }}>
                      {ref}
                    </Text>
                    <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                      <X size={20} color={t.colors.textMuted} strokeWidth={1.8} />
                    </Pressable>
                  </View>

                  <Text variant="scripture" style={{ color: t.colors.text, marginBottom: 22 }}>
                    {selected.text}
                  </Text>

                  <Pressable
                    onPress={async () => {
                      feedback.success?.();
                      await toggleSaved(ref);
                    }}
                    style={[s.action, { borderTopColor: t.colors.border }]}
                  >
                    <Bookmark
                      size={18}
                      color={saved ? t.colors.accent : t.colors.textMuted}
                      fill={saved ? t.colors.accent : 'transparent'}
                      strokeWidth={1.7}
                    />
                    <Text variant="bodyLarge" style={{ color: t.colors.text }}>
                      {saved ? 'Saved' : 'Save this verse'}
                    </Text>
                  </Pressable>

                  {/* Only offered where the chapter actually has questions. */}
                  {hasChapterQuestions(chapterKey) && (
                    <Pressable
                      onPress={() => {
                        feedback.select();
                        setSelected(null);
                        router.push({ pathname: '/way/lesson', params: { chapter: chapterKey } });
                      }}
                      style={[s.action, { borderTopColor: t.colors.border }]}
                    >
                      <HelpCircle size={18} color={t.colors.textMuted} strokeWidth={1.7} />
                      <Text variant="bodyLarge" style={{ color: t.colors.text }}>
                        Questions on this chapter
                      </Text>
                    </Pressable>
                  )}
                </>
              );
            })()}
          </View>
        </Modal>

        {/* Version picker */}
        <Modal visible={showVersions} animationType="slide" transparent onRequestClose={() => setShowVersions(false)}>
          <Pressable style={s.backdrop} onPress={() => setShowVersions(false)} />
          <View style={[s.sheet, { backgroundColor: t.colors.background, borderColor: t.colors.border }]}>
            <View style={s.sheetHead}>
              <Text variant="title" style={{ color: t.colors.text }}>Translation</Text>
              <Pressable onPress={() => setShowVersions(false)} hitSlop={10}>
                <X size={20} color={t.colors.textMuted} strokeWidth={1.8} />
              </Pressable>
            </View>

            {VERSIONS.map((item) => {
              const active = item.id === version;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => changeVersion(item.id)}
                  style={[
                    s.versionRow,
                    {
                      backgroundColor: active ? t.colors.accent + '14' : 'transparent',
                      borderColor: active ? t.colors.accent + '44' : t.colors.border + '77',
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="body" style={{ color: t.colors.text, fontFamily: active ? t.fonts.sansSemi : t.fonts.sans }}>
                      {item.name}
                    </Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>{item.note}</Text>
                  </View>
                  {active && <Check size={17} color={t.colors.accent} strokeWidth={2.4} />}
                </Pressable>
              );
            })}

            <Text variant="caption" tone="muted" style={s.sheetNote}>
              These translations are in the public domain. Licensed texts such as
              the ESV and NIV require an agreement with their publishers.
            </Text>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ── Chapter picker ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <View style={[s.bar, { borderBottomColor: t.colors.border + '44' }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.iconBtn}>
          <ChevronLeft size={22} color={t.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted" uppercase>{book.group}</Text>
          <Text variant="body" style={{ color: t.colors.text, fontFamily: t.fonts.sansSemi }}>
            {book.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.picker} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(320)}>
          <Text variant="body" tone="muted">
            {gatheredCount} of {book.chapters} chapters gathered
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={s.grid}>
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => {
            const done = isGathered(n);
            return (
              <Pressable
                key={n}
                onPress={() => { feedback.select(); setOpenChapter(n); }}
                style={[
                  s.chapter,
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

const s = StyleSheet.create({
  flex: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { padding: 6, minWidth: 34 },
  pill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16,
    minHeight: MIN_TOUCH - 8,
  },
  divider: { width: StyleSheet.hairlineWidth, height: 15 },
  sizeRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sizeBtn: {
    width: 44, height: 40, borderRadius: 11, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  reader: { paddingHorizontal: 24, paddingTop: 22 },
  banner: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16,
  },
  verseRow: { flexDirection: 'row', gap: 9, marginBottom: 10 },
  verseNum: { fontSize: 11, minWidth: 20, textAlign: 'right', paddingTop: 1 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 34 },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderRadius: 12, paddingVertical: 14, minHeight: MIN_TOUCH,
  },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40, gap: 9,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  versionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    minHeight: MIN_TOUCH,
  },
  sheetNote: { marginTop: 12, lineHeight: 17 },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16, minHeight: MIN_TOUCH,
  },
  picker: { paddingHorizontal: 24, paddingTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 18 },
  chapter: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
