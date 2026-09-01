import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { X, RotateCcw } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { FadingVerse } from '@/components/manna/FadingVerse';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';
import { fetchChapter } from '@/services/bible';
import { formatRef } from '@/types/scripture';
import { justTreasured, isDue, type MemoryItem, type Recall } from '@/services/memory';
import { useTreasure } from '@/store/treasure';

type Phase = 'read' | 'notice' | 'missing' | 'build' | 'whisper' | 'treasured' | 'done';

/** Split a verse into phrases a person would actually recall as units. */
function phrasesOf(text: string): string[] {
  const byClause = text.split(/(?<=[,;:])\s+/).map((p) => p.trim()).filter(Boolean);
  if (byClause.length >= 3) return byClause;

  // Short or unpunctuated verses get even runs of words instead.
  const words = text.split(/\s+/);
  const size = Math.max(2, Math.ceil(words.length / 4));
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(' '));
  return out;
}

const shuffle = <T,>(a: T[]): T[] => {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

/**
 * TREASURE — the session.
 *
 * One verse at a time. A verse never met before is read, then noticed, then
 * gently tested; a verse already in progress goes straight to whichever mode
 * its strength calls for. The whole thing is one screen with phases rather
 * than a stack of routes, so leaving mid-verse is a single deliberate action.
 */
export default function TreasureSession() {
  const t = useTheme();
  const router = useRouter();
  const { items, sessionLength, hydrate, hydrated, setText, record, completeSession } = useTreasure();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  /**
   * Verses for this sitting.
   *
   * Deliberately simple while the interaction is being judged: due work first,
   * then anything in progress, then something new. The weighted selector waits
   * until the feel is right.
   */
  const session = useMemo(() => {
    if (!hydrated) return [];
    const due = items.filter((i) => i.state !== 'new' && isDue(i));
    const inProgress = items.filter((i) => i.state === 'learning' || i.state === 'remembering');
    const fresh = items.filter((i) => i.state === 'new');
    const seen = new Set<string>();
    return [...due, ...inProgress, ...fresh]
      .filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
      .slice(0, sessionLength);
  }, [hydrated, sessionLength]); // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('read');
  const [loading, setLoading] = useState(false);
  const [slips, setSlips] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [placed, setPlaced] = useState<number[]>([]);
  const [tally, setTally] = useState({ practised: 0, strengthened: 0, treasured: 0 });
  const [justKept, setJustKept] = useState<MemoryItem | null>(null);

  const item = session[idx];
  const live = items.find((i) => i.id === item?.id) ?? item;
  const reference = live ? formatRef(live.ref) : '';

  /** Fetch a verse the first time it is met, then keep it for good. */
  useEffect(() => {
    if (!live || live.text) return;
    let alive = true;
    setLoading(true);
    fetchChapter(live.ref.book, live.ref.chapter, 'WEB')
      .then((verses) => {
        if (!alive) return;
        const from = live.ref.verseStart;
        const to = live.ref.verseEnd ?? from;
        const text = verses.filter((v) => v.number >= from && v.number <= to)
          .map((v) => v.text).join(' ');
        if (text) void setText(live.id, text);
        else skip();
      })
      .catch(() => {
        // Offline, or the chapter would not load. A new verse simply waits for
        // another day rather than ending the session with an error.
        if (alive) skip();
      })
      // Always clears, even when this effect has been superseded — skip() and
      // the empty-text path both change the current verse, which tears this
      // effect down before it settles. Guarding this line left the spinner up
      // for good.
      .finally(() => setLoading(false));
    return () => { alive = false; };
  }, [live?.id, live?.text]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Which mode a verse deserves, given how well it is known. */
  const openingPhase = useCallback((m: MemoryItem): Phase => {
    if (!m.introducedAt || m.strength === 0) return 'read';
    if (m.strength < 40) return 'missing';
    if (m.strength < 70) return 'build';
    return 'whisper';
  }, []);

  useEffect(() => {
    if (live?.text) setPhase(openingPhase(live));
  }, [live?.id, live?.text]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetPer = () => { setSlips(0); setRevealed(false); setPlaced([]); };

  const skip = useCallback(() => {
    resetPer();
    if (idx >= session.length - 1) { void finish(); return; }
    setIdx((i) => i + 1);
  }, [idx, session.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(async () => {
    await completeSession();
    setPhase('done');
  }, [completeSession]);

  /** Close out the current verse with a recall result, then move on. */
  const settle = useCallback(async (result: Recall) => {
    if (!live) return;
    const before = live;
    const after = await record(live.id, result);
    setTally((c) => ({
      practised: c.practised + 1,
      strengthened: c.strengthened + (result === 'remembered' ? 1 : 0),
      treasured: c.treasured + (after && justTreasured(before, after) ? 1 : 0),
    }));

    if (after && justTreasured(before, after)) {
      feedback.success?.();
      setJustKept(after);
      setPhase('treasured');
      return;
    }
    skip();
  }, [live, record, skip]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!hydrated || loading || (live && !live.text && phase !== 'done')) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
        <View style={s.centre}><ActivityIndicator color={t.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  // ── Session complete ───────────────────────────────────────────────────────
  if (phase === 'done' || !live) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
        <ScrollView contentContainerStyle={s.endWrap}>
          <Animated.View entering={FadeIn.duration(600)} style={s.centreBlock}>
            <Ornament width={112} opacity={0.45} />
            <Text variant="display" uppercase style={[s.endTitle, { color: t.colors.accent }]}>
              Treasured
            </Text>
            <Text variant="bodyLarge" style={[s.endLead, { color: t.colors.onImmersive }]}>
              Gathered and kept.
            </Text>

            <View style={s.endFigures}>
              {[
                { v: tally.practised, l: tally.practised === 1 ? 'Scripture practised' : 'Scriptures practised' },
                { v: tally.strengthened, l: 'strengthened' },
                { v: tally.treasured, l: 'newly treasured' },
              ].map((f) => (
                <View key={f.l} style={s.endFigure}>
                  <Text variant="h2" style={{ color: t.colors.onImmersive }}>{f.v}</Text>
                  <Text variant="caption" style={{ color: t.colors.onImmersiveMuted, marginTop: 3, textAlign: 'center' }}>
                    {f.l}
                  </Text>
                </View>
              ))}
            </View>

            <View style={s.endCta}>
              <Button label="Done" variant="primary" onPress={() => router.back()} />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── The Treasured moment ───────────────────────────────────────────────────
  if (phase === 'treasured' && justKept) {
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
        <ScrollView contentContainerStyle={s.endWrap}>
          <Animated.View entering={FadeIn.duration(700)} style={s.centreBlock}>
            <Text variant="scripture" style={[s.keptVerse, { color: t.colors.onImmersive }]}>
              {justKept.text}
            </Text>
            <View style={[s.keptRule, { backgroundColor: t.colors.accent }]} />
            <Text variant="display" uppercase style={[s.endTitle, { color: t.colors.accent }]}>
              Treasured
            </Text>
            <Text variant="reference" uppercase style={{ color: t.colors.onImmersiveMuted, marginTop: 10 }}>
              {formatRef(justKept.ref)}
            </Text>
            <Text variant="body" style={[s.endLead, { color: t.colors.onImmersiveMuted }]}>
              This Word is becoming yours.
            </Text>
            <View style={s.endCta}>
              <Button
                label="Continue"
                variant="primary"
                arrow
                onPress={() => { setJustKept(null); skip(); }}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Phases ─────────────────────────────────────────────────────────────────
  const words = live.text.split(/\s+/);
  const phrases = phrasesOf(live.text);
  const scrambled = stableScramble(live.id, phrases);

  /**
   * Which rung of the omission ladder this verse is on.
   *
   * The same rung feeds both the blanks and the tiles, so what is hidden and
   * what you are offered can never disagree — they did, which is why a verse
   * with one blank was asking for words in order.
   *
   * It is then filtered against the verse as actually fetched: a curated word
   * that does not appear in the WEB wording would otherwise leave a tile with
   * no gap to put it in.
   */
  const bare = (w: string) => w.replace(/[^A-Za-z’']/g, '').toLowerCase();

  const rung: string[] = (() => {
    const ladder = live.omissions.length
      ? live.omissions[Math.min(
          live.omissions.length - 1,
          live.strength < 30 ? 1 : live.strength < 60 ? 2 : live.omissions.length - 1,
        )] ?? live.omissions[0]
      : words.filter((w) => bare(w).length > 4).slice(0, 3);

    const present = new Set(words.map(bare));
    const kept = ladder.filter((w) => present.has(bare(w)));
    // If nothing matched, fall back rather than showing an exercise with no
    // gaps at all.
    return kept.length ? kept : words.filter((w) => bare(w).length > 4).slice(0, 3);
  })();

  const body = () => {
    switch (phase) {
      case 'read':
        return (
          <>
            <FadingVerse text={live.text} assistance={1} reference={reference} />
            <Text variant="body" style={[s.instruction, { color: t.colors.onImmersiveMuted }]}>
              Read it slowly.
            </Text>
            <Button label="Continue" variant="primary" arrow onPress={() => setPhase('notice')} />
          </>
        );

      case 'notice':
        return (
          <>
            <FadingVerse
              text={live.text}
              assistance={1}
              notice
              emphasis={live.emphasis}
              reference={reference}
            />
            <Text variant="body" style={[s.instruction, { color: t.colors.onImmersiveMuted }]}>
              Notice the words.
            </Text>
            <Button label="Continue" variant="primary" arrow onPress={() => setPhase('missing')} />
          </>
        );

      case 'missing': {
        const targets = rung;
        const offered = stableScramble(live.id + ':w', targets);
        const done = placed.length >= targets.length;
        return (
          <>
            <FadingVerse
              text={live.text}
              assistance={0.5}
              omissions={[rung]}
              reference={reference}
            />
            <Text variant="caption" style={[s.instruction, { color: t.colors.onImmersiveMuted }]}>
              {done
                ? 'Well kept.'
                : targets.length === 1
                ? 'Choose the missing word.'
                : `Choose the missing words, in order · ${placed.length} of ${targets.length}`}
            </Text>

            <View style={s.tiles}>
              {offered.map((w, i) => {
                const used = placed.includes(i);
                return (
                  <Pressable
                    key={`${w}-${i}`}
                    disabled={used || done}
                    onPress={() => {
                      if (offered[i] === targets[placed.length]) {
                        feedback.select(); setPlaced((p) => [...p, i]);
                      } else { feedback.error?.(); setSlips((n) => n + 1); }
                    }}
                    style={[s.tile, {
                      backgroundColor: used ? 'transparent' : t.colors.immersiveRaised,
                      borderColor: used ? t.colors.accent + '55' : 'rgba(245,239,227,0.2)',
                      opacity: used ? 0.4 : 1,
                    }]}
                  >
                    <Text variant="body" style={{ color: t.colors.onImmersive }}>{w}</Text>
                  </Pressable>
                );
              })}
            </View>

            {done && (
              <Button
                label="Continue"
                variant="primary"
                arrow
                onPress={() => settle(slips === 0 ? 'remembered' : 'almost')}
              />
            )}
          </>
        );
      }

      case 'build': {
        const done = placed.length >= phrases.length;
        return (
          <>
            <Text variant="reference" uppercase style={{ color: t.colors.accent, textAlign: 'center' }}>
              {reference}
            </Text>

            <View style={[s.buildArea, { borderColor: 'rgba(245,239,227,0.2)' }]}>
              {placed.length === 0 ? (
                <Text variant="body" style={{ color: t.colors.onImmersiveMuted }}>
                  Put the verse back together.
                </Text>
              ) : (
                <Text variant="scripture" style={{ color: t.colors.onImmersive, lineHeight: 30 }}>
                  {placed.map((p) => scrambled[p]).join(' ')}
                </Text>
              )}
            </View>

            <View style={s.tiles}>
              {scrambled.map((p, i) => {
                const used = placed.includes(i);
                return (
                  <Pressable
                    key={`${p}-${i}`}
                    disabled={used || done}
                    onPress={() => {
                      if (scrambled[i] === phrases[placed.length]) {
                        feedback.select(); setPlaced((q) => [...q, i]);
                      } else { feedback.error?.(); setSlips((n) => n + 1); }
                    }}
                    style={[s.tile, {
                      backgroundColor: used ? 'transparent' : t.colors.immersiveRaised,
                      borderColor: used ? t.colors.accent + '55' : 'rgba(245,239,227,0.2)',
                      opacity: used ? 0.4 : 1,
                    }]}
                  >
                    <Text variant="body" style={{ color: t.colors.onImmersive }}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>

            {!done && placed.length > 0 && (
              <Pressable onPress={() => setPlaced([])} style={s.reset}>
                <RotateCcw size={15} color={t.colors.onImmersiveMuted} strokeWidth={1.8} />
                <Text variant="caption" style={{ color: t.colors.onImmersiveMuted }}>Clear</Text>
              </Pressable>
            )}

            {done && (
              <Button
                label="Continue"
                variant="primary"
                arrow
                onPress={() => settle(slips === 0 ? 'remembered' : 'almost')}
              />
            )}
          </>
        );
      }

      case 'whisper':
        return (
          <>
            <Text variant="label" uppercase style={{ color: t.colors.accent, textAlign: 'center' }}>
              Whisper
            </Text>

            {revealed ? (
              <Animated.View entering={FadeIn.duration(800)}>
                <FadingVerse text={live.text} assistance={1} reference={reference} />
              </Animated.View>
            ) : (
              <View style={s.whisperQuiet}>
                <Text variant="h1" style={{ color: t.colors.onImmersive, textAlign: 'center' }}>
                  {reference}
                </Text>
                <Text variant="body" style={[s.instruction, { color: t.colors.onImmersiveMuted }]}>
                  Finish it aloud.
                </Text>
              </View>
            )}

            {!revealed ? (
              <Button label="Reveal" variant="onDark" onPress={() => setRevealed(true)} />
            ) : (
              <>
                <Text variant="body" style={[s.instruction, { color: t.colors.onImmersiveMuted }]}>
                  How did you do?
                </Text>
                <View style={s.judgements}>
                  {([
                    ['I remembered', 'remembered'],
                    ['Almost', 'almost'],
                    ['Not yet', 'notYet'],
                  ] as [string, Recall][]).map(([label, value]) => (
                    <Pressable
                      key={value}
                      onPress={() => settle(value)}
                      style={[s.judgement, { borderColor: 'rgba(245,239,227,0.22)' }]}
                    >
                      <Text variant="body" style={{ color: t.colors.onImmersive }}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.colors.immersive }]}>
      <StatusBar style="light" />

      <View style={s.bar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: 4 }}>
          <X size={20} color={t.colors.onImmersiveMuted} strokeWidth={1.8} />
        </Pressable>
        <View style={[s.progress, { backgroundColor: 'rgba(245,239,227,0.14)' }]}>
          <View style={[s.progressFill, {
            backgroundColor: t.colors.accent,
            width: `${(idx / Math.max(session.length, 1)) * 100}%`,
          }]} />
        </View>
        <Text variant="caption" style={{ color: t.colors.onImmersiveMuted }}>
          {idx + 1}/{session.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(420)} style={s.stack}>
          {body()}
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * A stable shuffle per verse, so tiles do not jump on every render.
 *
 * Deliberately not a hook — it is called inside a map and inside a press
 * handler, and naming it useSomething would put it in front of React's lint
 * for no reason.
 */
const scrambleCache = new Map<string, string[]>();
function stableScramble(key: string, source: string[]): string[] {
  const hit = scrambleCache.get(key);
  if (hit && hit.length === source.length) return hit;
  const made = shuffle(source);
  scrambleCache.set(key, made);
  return made;
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centreBlock: { alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18,
  },
  progress: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  content: { paddingHorizontal: 30, paddingTop: 20, flexGrow: 1 },
  stack: { gap: 26, flex: 1, justifyContent: 'center' },
  instruction: { textAlign: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center' },
  tile: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  buildArea: {
    borderWidth: 1.5, borderRadius: 16, borderStyle: 'dashed',
    padding: 18, minHeight: 110, justifyContent: 'center', alignItems: 'center',
  },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: MIN_TOUCH },
  whisperQuiet: { paddingVertical: 40 },
  judgements: { gap: 10 },
  judgement: {
    borderWidth: 1, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', minHeight: MIN_TOUCH, justifyContent: 'center',
  },
  endWrap: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 34, paddingVertical: 48 },
  endTitle: { letterSpacing: 5, lineHeight: 58, paddingTop: 6, textAlign: 'center', marginTop: 24 },
  endLead: { textAlign: 'center', marginTop: 14, lineHeight: 26 },
  endFigures: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 44 },
  endFigure: { flex: 1, alignItems: 'center' },
  endCta: { alignSelf: 'stretch', marginTop: 48 },
  keptVerse: { textAlign: 'center', lineHeight: 34 },
  keptRule: { width: 90, height: 1, marginTop: 28, opacity: 0.8 },
});
