import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import { X, Heart, ArrowRight, RotateCcw } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { useWay } from '@/store/way';
import { useGathered } from '@/store/gathered';
import { useProgress } from '@/store/progress';
import { QUESTIONS, CHAPTER_QUESTIONS, KIND_LABEL, type Question } from '@/data/way-questions';

const MAX_HEARTS = 3;
const PASS_MARK = 3;

/** Deterministic-enough shuffle; only used for presentation order. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normalise = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');

export default function WayLesson() {
  const t = useTheme();
  const router = useRouter();
  const { skillId, chapter } = useLocalSearchParams<{ skillId?: string; chapter?: string }>();

  /**
   * The same runner serves both banks: a Way topic, or the questions that
   * follow a chapter in the daily plan. Chapter questions record nothing in
   * The Way — they are about the reading, not the skill tree.
   */
  const isChapter = !!chapter;
  const topic = skillId ?? 'creation';

  const { recordAttempt } = useWay();
  const { gather } = useGathered();
  const recordDay = useProgress((s) => s.gather);

  const questions = isChapter
    ? (CHAPTER_QUESTIONS[chapter] ?? [])
    : (QUESTIONS[topic] ?? QUESTIONS.creation);
  const total = questions.length;

  const [qIdx, setQIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Per-question working state, reset on advance.
  const [choice, setChoice] = useState<number | boolean | null>(null);
  const [typed, setTyped] = useState('');
  const [built, setBuilt] = useState<number[]>([]);          // wordbank: indices used
  const [links, setLinks] = useState<Record<number, number>>({}); // match: text -> ref
  const [activeText, setActiveText] = useState<number | null>(null);

  const q = questions[qIdx] as Question;
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  // Presentation order for the shuffled formats, stable per question.
  const bank = useMemo(() => {
    if (q.kind !== 'wordbank') return [];
    return shuffle([...q.answer, ...(q.distractors ?? [])]);
  }, [q, qIdx]);

  const refOrder = useMemo(() => {
    if (q.kind !== 'match') return [];
    return shuffle(q.pairs.map((_, i) => i));
  }, [q, qIdx]);

  const wrong = useCallback(() => {
    feedback.error?.();
    setHearts((h) => h - 1);
    shake.value = withSequence(
      withTiming(-8, { duration: 60 }), withTiming(8, { duration: 60 }),
      withTiming(-6, { duration: 60 }), withTiming(0, { duration: 60 }),
    );
  }, [shake]);

  const settle = useCallback((ok: boolean) => {
    setCorrect(ok);
    setShowResult(true);
    if (ok) { feedback.success?.(); setScore((s) => s + 1); } else { wrong(); }
  }, [wrong]);

  const finish = useCallback(async (finalScore: number) => {
    setDone(true);
    const verses = questions
      .map((x) => ('verse' in x ? x.verse : undefined))
      .filter(Boolean) as string[];
    // Match questions carry their references in pairs rather than a verse field.
    const matchRefs = questions.flatMap((x) =>
      x.kind === 'match' ? x.pairs.map((p) => p.reference) : [],
    );

    // Chapter questions gather the verses they touch and record that the
    // chapter has been answered, but leave the skill tree alone — answering
    // them is reading, not progress through The Way.
    if (isChapter) {
      await Promise.all([
        gather([...verses, ...matchRefs]),
        recordDay(`chapter-${chapter}`, 0),
      ]);
      return;
    }

    await Promise.all([
      recordAttempt(topic, finalScore, total),
      gather([...verses, ...matchRefs]),
      finalScore >= PASS_MARK ? recordDay(`way-${topic}`, 0) : Promise.resolve(),
    ]);
  }, [questions, recordAttempt, gather, recordDay, topic, total, isChapter]);

  const next = useCallback(() => {
    if (hearts <= 0 || qIdx >= total - 1) { void finish(score); return; }
    setQIdx((i) => i + 1);
    setShowResult(false); setCorrect(false);
    setChoice(null); setTyped(''); setBuilt([]); setLinks({}); setActiveText(null);
  }, [hearts, qIdx, total, score, finish]);

  // ── Completion ─────────────────────────────────────────────────────────────
  if (done) {
    const passed = score >= PASS_MARK;
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.background }]}>
        <View style={s.centre}>
          <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center', gap: 20 }}>
            <Text style={{ fontSize: 56 }}>{passed ? '✦' : '◇'}</Text>
            <Text variant="title" style={{ color: t.colors.text, textAlign: 'center' }}>
              {isChapter
                ? (passed ? 'Held onto.' : 'Worth reading again.')
                : (passed ? 'Well gathered.' : 'Worth another look.')}
            </Text>
            <Text variant="body" tone="muted" style={{ textAlign: 'center', paddingHorizontal: 34, lineHeight: 22 }}>
              {isChapter
                ? `${score} of ${total}. The chapter is yours either way — these only help it stay.`
                : passed
                ? `${score} of ${total} correct. These verses are now part of your journey.`
                : `${score} of ${total}. Nothing is lost — come back to it whenever you like.`}
            </Text>
            <Button
              label={isChapter ? 'Back to the reading' : 'Return to The Way'}
              variant="primary"
              onPress={() => router.back()}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Answer surfaces ────────────────────────────────────────────────────────
  const optionStyle = (isAnswer: boolean, isPicked: boolean) => {
    let bg = t.colors.surface, border = t.colors.border, fg = t.colors.text;
    if (showResult && isAnswer) { bg = '#1A5535'; border = '#1A5535'; fg = '#F8F4EA'; }
    else if (showResult && isPicked) { bg = '#5E1A1A'; border = '#5E1A1A'; fg = '#F8F4EA'; }
    return { bg, border, fg };
  };

  const renderBody = () => {
    switch (q.kind) {
      case 'mcq':
      case 'whosaid': {
        const opts = q.options;
        return (
          <>
            {q.kind === 'whosaid' && (
              <View style={[s.quote, { borderLeftColor: t.colors.accent }]}>
                <Text variant="scripture" style={{ color: t.colors.text }}>“{q.quote}”</Text>
              </View>
            )}
            <View style={s.options}>
              {opts.map((opt, i) => {
                const { bg, border, fg } = optionStyle(i === q.answer, choice === i);
                return (
                  <Pressable
                    key={i}
                    disabled={showResult}
                    onPress={() => { setChoice(i); settle(i === q.answer); }}
                    style={[s.option, { backgroundColor: bg, borderColor: border }]}
                  >
                    <Text variant="body" style={{ color: fg }}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      }

      case 'tf':
        return (
          <View style={s.options}>
            {[true, false].map((v) => {
              const { bg, border, fg } = optionStyle(v === q.answer, choice === v);
              return (
                <Pressable
                  key={String(v)}
                  disabled={showResult}
                  onPress={() => { setChoice(v); settle(v === q.answer); }}
                  style={[s.option, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text variant="body" style={{ color: fg }}>{v ? 'True' : 'False'}</Text>
                </Pressable>
              );
            })}
          </View>
        );

      case 'cloze':
        return (
          <>
            <View style={[s.passage, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
              <Text variant="scripture" style={{ color: t.colors.text }}>{q.text}</Text>
            </View>
            <View style={s.options}>
              {q.options.map((opt, i) => {
                const { bg, border, fg } = optionStyle(i === q.answer, choice === i);
                return (
                  <Pressable
                    key={i}
                    disabled={showResult}
                    onPress={() => { setChoice(i); settle(i === q.answer); }}
                    style={[s.option, { backgroundColor: bg, borderColor: border }]}
                  >
                    <Text variant="body" style={{ color: fg }}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        );

      case 'type': {
        const accepted = [q.answer, ...(q.accept ?? [])].map(normalise);
        return (
          <>
            <View style={[s.passage, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
              <Text variant="scripture" style={{ color: t.colors.text }}>{q.text}</Text>
            </View>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              editable={!showResult}
              placeholder="Type your answer"
              placeholderTextColor={t.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[s.input, {
                backgroundColor: t.colors.surface,
                borderColor: showResult
                  ? (correct ? '#1A5535' : '#5E1A1A')
                  : t.colors.border,
                color: t.colors.text,
              }]}
              accessibilityLabel="Your answer"
            />
            {!showResult && (
              <Pressable
                disabled={!typed.trim()}
                onPress={() => settle(accepted.includes(normalise(typed)))}
                style={[s.check, {
                  backgroundColor: typed.trim() ? t.colors.primary : t.colors.border,
                }]}
              >
                <Text variant="body" style={{ color: typed.trim() ? t.colors.onPrimary : t.colors.textMuted }}>
                  Check
                </Text>
              </Pressable>
            )}
            {showResult && !correct && (
              <Text variant="body" style={{ color: t.colors.accent, marginTop: 10 }}>
                The word is “{q.answer}”.
              </Text>
            )}
          </>
        );
      }

      case 'wordbank': {
        const chosen = built.map((i) => bank[i]);
        const isRight = chosen.join(' ') === q.answer.join(' ');
        return (
          <>
            {/* The line being built */}
            <View style={[s.buildArea, { borderColor: showResult ? (correct ? '#1A5535' : '#5E1A1A') : t.colors.border }]}>
              {chosen.length === 0 ? (
                <Text variant="body" tone="muted">Tap the words in order</Text>
              ) : (
                <View style={s.tiles}>
                  {built.map((bi, pos) => (
                    <Pressable
                      key={`${bi}-${pos}`}
                      disabled={showResult}
                      onPress={() => setBuilt((b) => b.filter((_, p) => p !== pos))}
                      style={[s.tile, { backgroundColor: t.colors.accent + '22', borderColor: t.colors.accent + '55' }]}
                    >
                      <Text variant="body" style={{ color: t.colors.text }}>{bank[bi]}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* The bank */}
            <View style={s.tiles}>
              {bank.map((w, i) => {
                const used = built.includes(i);
                return (
                  <Pressable
                    key={i}
                    disabled={used || showResult}
                    onPress={() => setBuilt((b) => [...b, i])}
                    style={[s.tile, {
                      backgroundColor: used ? 'transparent' : t.colors.surface,
                      borderColor: used ? t.colors.border + '55' : t.colors.border,
                      opacity: used ? 0.35 : 1,
                    }]}
                  >
                    <Text variant="body" style={{ color: t.colors.text }}>{w}</Text>
                  </Pressable>
                );
              })}
            </View>

            {!showResult && (
              <View style={s.buildActions}>
                <Pressable onPress={() => setBuilt([])} style={s.reset}>
                  <RotateCcw size={15} color={t.colors.textMuted} strokeWidth={1.8} />
                  <Text variant="caption" tone="muted">Clear</Text>
                </Pressable>
                <Pressable
                  disabled={built.length === 0}
                  onPress={() => settle(isRight)}
                  style={[s.check, {
                    flex: 1,
                    backgroundColor: built.length ? t.colors.primary : t.colors.border,
                  }]}
                >
                  <Text variant="body" style={{ color: built.length ? t.colors.onPrimary : t.colors.textMuted }}>
                    Check
                  </Text>
                </Pressable>
              </View>
            )}

            {showResult && !correct && (
              <Text variant="scripture" style={{ color: t.colors.accent, marginTop: 12 }}>
                {q.answer.join(' ')}
              </Text>
            )}
          </>
        );
      }

      case 'match': {
        const allLinked = Object.keys(links).length === q.pairs.length;
        return (
          <>
            <View style={s.matchCols}>
              {/* Verses */}
              <View style={s.matchCol}>
                {q.pairs.map((p, i) => {
                  const linked = links[i] !== undefined;
                  const isActive = activeText === i;
                  const right = showResult && links[i] === i;
                  return (
                    <Pressable
                      key={i}
                      disabled={showResult}
                      onPress={() => setActiveText(isActive ? null : i)}
                      style={[s.matchCard, {
                        backgroundColor: showResult
                          ? (right ? '#1A5535' : '#5E1A1A')
                          : isActive ? t.colors.accent + '22' : t.colors.surface,
                        borderColor: showResult
                          ? (right ? '#1A5535' : '#5E1A1A')
                          : isActive ? t.colors.accent : t.colors.border,
                        opacity: linked && !isActive && !showResult ? 0.55 : 1,
                      }]}
                    >
                      <Text
                        variant="body"
                        style={{ color: showResult ? '#F8F4EA' : t.colors.text, fontSize: 14, lineHeight: 20 }}
                      >
                        {p.text}
                      </Text>
                      {linked && (
                        <Text variant="caption" style={{ color: showResult ? '#F8F4EA' : t.colors.accent, marginTop: 6 }}>
                          {q.pairs[links[i]].reference}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* References */}
            <Text variant="caption" tone="muted" uppercase style={{ marginTop: 6, marginBottom: 8 }}>
              {activeText === null ? 'Tap a verse, then its reference' : 'Now tap its reference'}
            </Text>
            <View style={s.tiles}>
              {refOrder.map((ri) => {
                const used = Object.values(links).includes(ri);
                return (
                  <Pressable
                    key={ri}
                    disabled={showResult || activeText === null || used}
                    onPress={() => {
                      if (activeText === null) return;
                      setLinks((l) => ({ ...l, [activeText]: ri }));
                      setActiveText(null);
                    }}
                    style={[s.tile, {
                      backgroundColor: used ? 'transparent' : t.colors.surface,
                      borderColor: used ? t.colors.border + '55' : t.colors.border,
                      opacity: used ? 0.35 : activeText === null ? 0.6 : 1,
                    }]}
                  >
                    <Text variant="body" style={{ color: t.colors.text }}>
                      {q.pairs[ri].reference}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!showResult && (
              <View style={s.buildActions}>
                <Pressable onPress={() => { setLinks({}); setActiveText(null); }} style={s.reset}>
                  <RotateCcw size={15} color={t.colors.textMuted} strokeWidth={1.8} />
                  <Text variant="caption" tone="muted">Clear</Text>
                </Pressable>
                <Pressable
                  disabled={!allLinked}
                  onPress={() => settle(q.pairs.every((_, i) => links[i] === i))}
                  style={[s.check, { flex: 1, backgroundColor: allLinked ? t.colors.primary : t.colors.border }]}
                >
                  <Text variant="body" style={{ color: allLinked ? t.colors.onPrimary : t.colors.textMuted }}>
                    Check
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        );
      }
    }
  };

  const promptText = q.kind === 'whosaid' ? 'Who said this?' : q.prompt;

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.colors.background }]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: 4 }}>
          <X size={20} color={t.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
        <View style={[s.progress, { backgroundColor: t.colors.surface }]}>
          <View style={[s.progressFill, { backgroundColor: t.colors.accent, width: `${(qIdx / total) * 100}%` }]} />
        </View>
        <View style={s.hearts}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              size={17}
              fill={i < hearts ? '#B4574F' : 'transparent'}
              color={i < hearts ? '#B4574F' : t.colors.border}
              strokeWidth={1.5}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(280)} style={shakeStyle}>
          <Text variant="caption" tone="muted" uppercase>
            {KIND_LABEL[q.kind]} · {qIdx + 1} of {total}
          </Text>
          <Text variant="title" style={[s.prompt, { color: t.colors.text }]}>{promptText}</Text>

          {renderBody()}

          {showResult && (
            <Animated.View
              entering={FadeInDown.duration(360)}
              style={[s.insight, {
                backgroundColor: correct ? '#1A5535' + '14' : '#5E1A1A' + '14',
                borderColor: correct ? '#1A5535' + '3A' : '#5E1A1A' + '3A',
              }]}
            >
              <Text variant="caption" style={{ color: correct ? '#356653' : '#A85A55', fontFamily: t.fonts.sansSemi }}>
                {correct ? 'Correct' : 'Not quite'}
              </Text>
              <Text variant="body" style={{ color: t.colors.text, marginTop: 6, lineHeight: 21 }}>
                {q.insight}
              </Text>
              {'verse' in q && q.verse && (
                <Text variant="reference" style={{ color: t.colors.accent, marginTop: 8 }}>{q.verse}</Text>
              )}
              <Pressable
                onPress={next}
                style={[s.next, {
                  backgroundColor: correct ? '#356653' : t.colors.surface,
                  borderColor: correct ? '#356653' : t.colors.border,
                }]}
              >
                <Text variant="body" style={{ color: correct ? '#F8F4EA' : t.colors.text, fontFamily: t.fonts.sansSemi }}>
                  {qIdx >= total - 1 || hearts <= 0 ? 'See results' : 'Continue'}
                </Text>
                <ArrowRight size={16} color={correct ? '#F8F4EA' : t.colors.text} strokeWidth={2} />
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  progress: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  hearts: { flexDirection: 'row', gap: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  prompt: { fontSize: 21, lineHeight: 29, marginTop: 8, marginBottom: 22 },
  quote: { borderLeftWidth: 2, paddingLeft: 16, paddingVertical: 4, marginBottom: 20 },
  passage: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 20 },
  options: { gap: 11 },
  option: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 18, minHeight: MIN_TOUCH, justifyContent: 'center' },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 15, fontSize: 17, minHeight: MIN_TOUCH },
  check: { borderRadius: 13, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 12, minHeight: MIN_TOUCH },
  buildArea: { borderWidth: 1.5, borderRadius: 16, borderStyle: 'dashed', padding: 16, minHeight: 88, marginBottom: 18, justifyContent: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { borderWidth: 1.5, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  buildActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  reset: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4 },
  matchCols: { marginBottom: 4 },
  matchCol: { gap: 10 },
  matchCard: { borderWidth: 1.5, borderRadius: 14, padding: 14 },
  insight: { borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 22 },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, borderWidth: 1, borderRadius: 12, paddingVertical: 14, minHeight: MIN_TOUCH },
});
