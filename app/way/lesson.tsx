import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Pressable, ScrollView, StyleSheet, TextInput, Image, type LayoutRectangle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming,
  withSpring, runOnJS,
} from 'react-native-reanimated';
import { X, ArrowRight, RotateCcw, Check } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { AnswerCard, type AnswerState } from '@/components/primitives/AnswerCard';
import { LampIndicator } from '@/components/manna/LampIndicator';
import { Ornament } from '@/components/manna/Ornament';
import { TOPIC_ART } from '@/components/manna/screen-art';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { useWay, passMarkFor } from '@/store/way';
import { useGathered } from '@/store/gathered';
import { useProgress, useTimeInWord } from '@/store/progress';
import { QUESTIONS, CHAPTER_QUESTIONS, KIND_LABEL, type Question } from '@/data/way-questions';

const MAX_LAMPS = 3;

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

/**
 * A placed word that can be dragged to a new position.
 *
 * Tapping still returns it to the bank; dragging reorders. Position is worked
 * out from where the finger lands against the measured tile rectangles, so it
 * behaves correctly when the line wraps.
 */
const DragTile = ({
  label, index, onMeasure, onMove, onRemove, disabled, colours,
}: {
  label: string;
  index: number;
  onMeasure: (i: number, r: LayoutRectangle) => void;
  onMove: (from: number, dx: number, dy: number) => void;
  onRemove: (i: number) => void;
  disabled: boolean;
  colours: { bg: string; border: string; text: string };
}) => {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const held = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activateAfterLongPress(120)
    .onStart(() => { held.value = withTiming(1, { duration: 120 }); })
    .onUpdate((e) => { dx.value = e.translationX; dy.value = e.translationY; })
    .onEnd((e) => {
      runOnJS(onMove)(index, e.translationX, e.translationY);
      dx.value = withSpring(0, { damping: 20 });
      dy.value = withSpring(0, { damping: 20 });
      held.value = withTiming(0, { duration: 160 });
    });

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onEnd(() => { runOnJS(onRemove)(index); });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value },
      { translateY: dy.value },
      { scale: 1 + held.value * 0.07 },
    ],
    zIndex: held.value > 0 ? 20 : 1,
    opacity: 1 - held.value * 0.15,
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View
        onLayout={(e) => onMeasure(index, e.nativeEvent.layout)}
        style={[
          s.tile,
          { backgroundColor: colours.bg, borderColor: colours.border },
          style,
        ]}
      >
        <Text variant="body" style={{ color: colours.text }}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

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

  // A lesson counts as time in the Word.
  useTimeInWord();

  const questions = isChapter
    ? (CHAPTER_QUESTIONS[chapter] ?? [])
    : (QUESTIONS[topic] ?? []);
  const total = questions.length;
  /** Proportional, so a longer topic is not easier to pass. */
  const passMark = passMarkFor(total);

  const [qIdx, setQIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_LAMPS);
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

  const q = questions[qIdx] as Question | undefined;
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  // Presentation order for the shuffled formats, stable per question.
  const bank = useMemo(() => {
    if (!q || q.kind !== 'wordbank') return [];
    return shuffle([...q.answer, ...(q.distractors ?? [])]);
  }, [q, qIdx]);

  const refOrder = useMemo(() => {
    if (!q || q.kind !== 'match') return [];
    return shuffle(q.pairs.map((_, i) => i));
  }, [q, qIdx]);

  /** Measured rectangles of the placed tiles, used to resolve a drop. */
  const tileRects = useRef<Record<number, LayoutRectangle>>({});

  const measureTile = useCallback((i: number, r: LayoutRectangle) => {
    tileRects.current[i] = r;
  }, []);

  const removeTile = useCallback((pos: number) => {
    setBuilt((b) => b.filter((_, p) => p !== pos));
    tileRects.current = {};
  }, []);

  /** Drop a dragged tile into whichever position its centre landed nearest. */
  const moveTile = useCallback((from: number, dx: number, dy: number) => {
    const rects = tileRects.current;
    const origin = rects[from];
    if (!origin) return;

    const dropX = origin.x + origin.width / 2 + dx;
    const dropY = origin.y + origin.height / 2 + dy;

    let nearest = from;
    let best = Infinity;
    for (const [key, r] of Object.entries(rects)) {
      const i = Number(key);
      const d =
        (r.x + r.width / 2 - dropX) ** 2 + (r.y + r.height / 2 - dropY) ** 2;
      if (d < best) { best = d; nearest = i; }
    }
    if (nearest === from) return;

    setBuilt((b) => {
      const next = [...b];
      const [moved] = next.splice(from, 1);
      next.splice(nearest, 0, moved);
      return next;
    });
    tileRects.current = {};
    feedback.select();
  }, []);

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

  /** How an option should look, given the selection and whether it is checked. */
  const answerState = useCallback(
    (isAnswer: boolean, isPicked: boolean): AnswerState => {
      if (!showResult) return isPicked ? 'selected' : 'default';
      if (isAnswer) return 'correct';
      if (isPicked) return 'incorrect';
      return 'disabled';
    },
    [showResult],
  );

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
      finalScore >= passMark ? recordDay(`way-${topic}`, 0) : Promise.resolve(),
    ]);
  }, [questions, recordAttempt, gather, recordDay, topic, total, isChapter, passMark]);

  const next = useCallback(() => {
    if (hearts <= 0 || qIdx >= total - 1) { void finish(score); return; }
    setQIdx((i) => i + 1);
    setShowResult(false); setCorrect(false);
    setChoice(null); setTyped(''); setBuilt([]); setLinks({}); setActiveText(null);
  }, [hearts, qIdx, total, score, finish]);

  // ── Completion ─────────────────────────────────────────────────────────────
  /**
   * A topic with no questions yet.
   *
   * Previously this fell back to Creation's questions, so an unwritten topic
   * silently taught the wrong lesson. Saying nothing is ready is honest, and
   * matters more as the tree grows.
   */
  if (!q || total === 0) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: 4 }}>
            <X size={20} color={t.colors.onImmersiveMuted} strokeWidth={1.8} />
          </Pressable>
        </View>
        <View style={s.centre}>
          <Ornament width={116} opacity={0.4} />
          <Text variant="h1" style={{ color: t.colors.onImmersive, textAlign: 'center', marginTop: 28 }}>
            Not yet written.
          </Text>
          <Text
            variant="body"
            style={{ color: t.colors.onImmersiveMuted, textAlign: 'center', marginTop: 14, lineHeight: 24 }}
          >
            This part of the story is still being prepared. It will be here soon.
          </Text>
          <View style={{ alignSelf: 'stretch', marginTop: 40 }}>
            <Button label="Back to The Way" variant="primary" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    const passed = score >= passMark;
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
            <Text variant="body" tone="muted" style={{ textAlign: 'center', lineHeight: 22 }}>
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
  // The reward is the teaching, not the verdict — so the result takes the whole
  // screen rather than appearing as a panel beneath the question.
  if (showResult) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
        <ScrollView contentContainerStyle={s.teaching} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(420)} style={s.teachingTop}>
            <View
              style={[
                s.ring,
                {
                  borderColor: correct ? t.colors.accent : 'rgba(245,239,227,0.28)',
                  backgroundColor: correct ? t.colors.accent + '18' : 'transparent',
                },
              ]}
            >
              {correct && <Check size={26} color={t.colors.accent} strokeWidth={2.4} />}
            </View>

            <Text
              variant="label"
              uppercase
              style={{ color: correct ? t.colors.accent : t.colors.onImmersiveMuted, marginTop: 18 }}
            >
              {correct ? 'Well done' : 'Not quite'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(520)} style={s.teachingBody}>
            <Ornament width={116} opacity={0.4} />

            {q.teachingKeyword ? (
              <>
                <Text variant="display" style={[s.keyword, { color: t.colors.accent }]}>
                  {q.teachingKeyword}
                </Text>
                <Text variant="bodyLarge" style={[s.teachingText, { color: t.colors.onImmersive }]}>
                  {q.insight}
                </Text>
              </>
            ) : (
              <Text variant="h1" style={[s.teachingLead, { color: t.colors.onImmersive }]}>
                {q.insight}
              </Text>
            )}

            {'verse' in q && q.verse && (
              <Text variant="reference" uppercase style={{ color: t.colors.accent, marginTop: 22 }}>
                {q.verse}
              </Text>
            )}

            {!correct && q.kind === 'type' && (
              <Text variant="body" style={{ color: t.colors.onImmersiveMuted, marginTop: 20 }}>
                The word is “{q.answer}”.
              </Text>
            )}
            {!correct && q.kind === 'wordbank' && (
              <Text
                variant="scripture"
                style={{ color: t.colors.onImmersiveMuted, marginTop: 20, textAlign: 'center' }}
              >
                {q.answer.join(' ')}
              </Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(460)} style={s.teachingCta}>
            <Button
              label={qIdx >= total - 1 || hearts <= 0 ? 'See results' : 'Continue'}
              variant="primary"
              arrow
              onPress={next}
            />
            {hearts < MAX_LAMPS && (
              <Text
                variant="caption"
                style={{ color: t.colors.onImmersiveMuted, marginTop: 16, textAlign: 'center' }}
              >
                {hearts === 1 ? 'One lamp remaining.' : `${hearts} lamps remaining.`}
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const MARKERS = ['A', 'B', 'C', 'D'];

  const renderBody = () => {
    switch (q.kind) {
      case 'mcq':
      case 'whosaid': {
        const opts = q.options;
        return (
          <>
            {q.kind === 'whosaid' && (
              <View style={[s.quote, { borderLeftColor: t.colors.accent }]}>
                <Text variant="scripture" style={{ color: t.colors.onImmersive }}>“{q.quote}”</Text>
              </View>
            )}
            <View style={s.options}>
              {opts.map((opt, i) => (
                <AnswerCard
                  key={i}
                  label={opt}
                  marker={MARKERS[i]}
                  state={answerState(i === q.answer, choice === i)}
                  onDark
                  onPress={() => { setChoice(i); settle(i === q.answer); }}
                />
              ))}
            </View>
          </>
        );
      }

      case 'tf':
        return (
          <View style={s.options}>
            {[true, false].map((v) => (
              <AnswerCard
                key={String(v)}
                label={v ? 'True' : 'False'}
                state={answerState(v === q.answer, choice === v)}
                onDark
                onPress={() => { setChoice(v); settle(v === q.answer); }}
              />
            ))}
          </View>
        );

      case 'cloze':
        return (
          <>
            <View style={[s.passage, { backgroundColor: t.colors.immersiveRaised, borderColor: 'rgba(245,239,227,0.14)' }]}>
              <Text variant="scripture" style={{ color: t.colors.onImmersive }}>{q.text}</Text>
            </View>
            <View style={s.options}>
              {q.options.map((opt, i) => (
                <AnswerCard
                  key={i}
                  label={opt}
                  marker={MARKERS[i]}
                  state={answerState(i === q.answer, choice === i)}
                  onDark
                  onPress={() => { setChoice(i); settle(i === q.answer); }}
                />
              ))}
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
                backgroundColor: t.colors.immersiveRaised,
                borderColor: showResult
                  ? (correct ? t.colors.accent : t.colors.memory)
                  : 'rgba(245,239,227,0.22)',
                color: t.colors.onImmersive,
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
            <View style={[s.buildArea, { borderColor: showResult ? (correct ? t.colors.accent : t.colors.memory) : 'rgba(245,239,227,0.22)' }]}>
              {chosen.length === 0 ? (
                <Text variant="body" style={{ color: t.colors.onImmersiveMuted }}>Tap the words in order</Text>
              ) : (
                <View style={s.tiles}>
                  {built.map((bi, pos) => (
                    <DragTile
                      key={`${bi}-${pos}`}
                      index={pos}
                      label={bank[bi]}
                      disabled={showResult}
                      onMeasure={measureTile}
                      onMove={moveTile}
                      onRemove={removeTile}
                      colours={{
                        bg: t.colors.accent + '22',
                        border: t.colors.accent + '55',
                        text: t.colors.onImmersive,
                      }}
                    />
                  ))}
                </View>
              )}
            </View>

            {!showResult && chosen.length > 0 && (
              <Text variant="caption" tone="muted" style={s.buildHint}>
                Tap a word to take it back, or hold and drag to move it.
              </Text>
            )}

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
                      backgroundColor: used ? 'transparent' : t.colors.immersiveRaised,
                      borderColor: used ? 'rgba(245,239,227,0.14)' : 'rgba(245,239,227,0.22)',
                      opacity: used ? 0.35 : 1,
                    }]}
                  >
                    <Text variant="body" style={{ color: t.colors.onImmersive }}>{w}</Text>
                  </Pressable>
                );
              })}
            </View>

            {!showResult && (
              <View style={s.buildActions}>
                <Pressable onPress={() => { setBuilt([]); tileRects.current = {}; }} style={s.reset}>
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
                          ? (right ? t.colors.accent + '20' : 'rgba(114,80,91,0.24)')
                          : isActive ? t.colors.accent + '1E' : t.colors.immersiveRaised,
                        borderColor: showResult
                          ? (right ? t.colors.accent : t.colors.memory)
                          : isActive ? t.colors.accent : 'rgba(245,239,227,0.18)',
                        opacity: linked && !isActive && !showResult ? 0.55 : 1,
                      }]}
                    >
                      <Text
                        variant="body"
                        style={{ color: t.colors.onImmersive, fontSize: 14, lineHeight: 20 }}
                      >
                        {p.text}
                      </Text>
                      {linked && (
                        <Text variant="caption" style={{ color: t.colors.accent, marginTop: 6 }}>
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
                      backgroundColor: used ? 'transparent' : t.colors.immersiveRaised,
                      borderColor: used ? 'rgba(245,239,227,0.14)' : 'rgba(245,239,227,0.22)',
                      opacity: used ? 0.35 : activeText === null ? 0.6 : 1,
                    }]}
                  >
                    <Text variant="body" style={{ color: t.colors.onImmersive }}>
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
    <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
      {/* The topic's engraving sits at the foot and dissolves upward —
          atmosphere for the question, never competing with it. */}
      {!isChapter && TOPIC_ART[topic] && (
        <View style={s.environment} pointerEvents="none">
          {/*
            Cropped to a band rather than shown whole. The engravings are
            circular vignettes, and displayed complete they read as a medallion
            stuck to the bottom of the screen instead of a landscape the page
            is standing in.
          */}
          <Image source={TOPIC_ART[topic]} style={s.environmentImage} resizeMode="cover" />
          <LinearGradient
            colors={[t.colors.immersive, t.colors.immersive + 'E6', t.colors.immersive + '00']}
            locations={[0, 0.3, 0.85]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: 4 }}>
          <X size={20} color={t.colors.onImmersiveMuted} strokeWidth={1.8} />
        </Pressable>
        <View style={[s.progress, { backgroundColor: 'rgba(245,239,227,0.14)' }]}>
          <View style={[s.progressFill, { backgroundColor: t.colors.accent, width: `${(qIdx / total) * 100}%` }]} />
        </View>
        <LampIndicator remaining={hearts} total={MAX_LAMPS} size={21} />
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(280)} style={shakeStyle}>
          <Text variant="label" uppercase style={{ color: t.colors.onImmersiveMuted }}>
            {KIND_LABEL[q.kind]} · {qIdx + 1} of {total}
          </Text>
          <Text variant="h1" style={[s.prompt, { color: t.colors.onImmersive }]}>
            {promptText}
          </Text>

          <View style={s.divider}>
            <Ornament width={104} opacity={0.45} />
          </View>

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
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  progress: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  hearts: { flexDirection: 'row', gap: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  environment: {
    position: 'absolute', left: -40, right: -40, bottom: -30, height: 260, opacity: 0.3,
  },
  environmentImage: { width: '100%', height: '100%' },
  divider: { alignItems: 'center', marginBottom: 30 },
  prompt: { fontSize: 34, lineHeight: 43, marginTop: 14, marginBottom: 28 },
  quote: { borderLeftWidth: 2, paddingLeft: 16, paddingVertical: 4, marginBottom: 20 },
  passage: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 20 },
  options: { gap: 11 },
  option: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 18, minHeight: MIN_TOUCH, justifyContent: 'center' },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 15, fontSize: 17, minHeight: MIN_TOUCH },
  check: { borderRadius: 13, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 12, minHeight: MIN_TOUCH },
  buildArea: { borderWidth: 1.5, borderRadius: 16, borderStyle: 'dashed', padding: 16, minHeight: 88, marginBottom: 18, justifyContent: 'center' },
  buildHint: { marginTop: -10, marginBottom: 14 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { borderWidth: 1.5, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  buildActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  reset: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4 },
  matchCols: { marginBottom: 4 },
  matchCol: { gap: 10 },
  matchCard: { borderWidth: 1.5, borderRadius: 14, padding: 14 },
  teaching: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 44 },
  teachingTop: { alignItems: 'center' },
  ring: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  teachingBody: { alignItems: 'center', marginTop: 40, flex: 1, justifyContent: 'center' },
  // Instrument Serif has tall ascenders, so any line box tighter than about
  // 1.2x the font size clips the top of capitals on iOS.
  keyword: {
    textAlign: 'center', marginTop: 28, letterSpacing: 1,
    lineHeight: 58, paddingTop: 6,
  },
  /** Supporting copy beneath a keyword — sits at bodyLarge. */
  teachingText: { textAlign: 'center', marginTop: 22, lineHeight: 27 },
  /** The insight when it leads on its own — sits at h1, so it needs more room. */
  teachingLead: { textAlign: 'center', marginTop: 26, lineHeight: 38, paddingTop: 4 },
  teachingCta: { marginTop: 40 },
  insight: { borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 22 },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, borderWidth: 1, borderRadius: 12, paddingVertical: 14, minHeight: MIN_TOUCH },
});
