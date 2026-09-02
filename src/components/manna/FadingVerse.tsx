import React, { useMemo } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';

/**
 * FADING VERSE
 *
 * Scripture with progressive assistance. As assistance falls the words leave
 * the page — the idea being that they have gone somewhere else.
 *
 * Which words go is curated, not mechanical. Hiding every third word produces
 * gaps at “the” and “and”, which tests nothing; the omission ladder in the seed
 * data names the words worth recalling. Where that metadata runs out it falls
 * back to content words, never to articles, conjunctions or prepositions.
 */

interface Props {
  text: string;
  /** 1.0 full text → 0.0 reference only. */
  assistance: number;
  reference: string;
  /** Words worth illuminating when the verse is being noticed. */
  emphasis?: string[];
  /** Curated omission sets, easiest first. */
  omissions?: string[][];
  /** Illuminate the emphasis words rather than hiding anything. */
  notice?: boolean;
  /**
   * Words the reader has supplied so far, in order. They fill the blanks from
   * the left as they are chosen — without this the verse stays empty while you
   * answer, and there is no way to see what you have built.
   */
  filled?: string[];
  /**
   * Whether to print the reference. Off when the reference is the thing being
   * asked for — otherwise the answer sits under the question.
   */
  showReference?: boolean;
  size?: number;
}

/** Words never worth hiding — removing them tests nothing. */
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'at',
  'by', 'for', 'with', 'from', 'as', 'is', 'was', 'be', 'are', 'were', 'his',
  'her', 'its', 'my', 'your', 'their', 'that', 'this', 'you', 'he', 'she',
  'it', 'they', 'we', 'i', 'not', 'shall', 'will',
]);

const bare = (w: string) => w.replace(/[^A-Za-z’']/g, '').toLowerCase();

export const FadingVerse = ({
  text, assistance, reference, emphasis = [], omissions = [], notice = false,
  filled = [], showReference = true, size = 22,
}: Props) => {
  const t = useTheme();
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  /**
   * Indices to hide at this level of assistance.
   *
   * Repeated words are handled by consuming each curated word once, in order,
   * so “love” appearing three times does not blank all three the moment it is
   * named once.
   */
  const hidden = useMemo(() => {
    const out = new Set<number>();
    if (assistance >= 1 || notice) return out;

    // Choose a rung of the curated ladder from the assistance level.
    const rung = omissions.length
      ? omissions[
          Math.min(
            omissions.length - 1,
            Math.max(0, Math.round((1 - assistance) * omissions.length) - 1),
          )
        ]
      : [];

    const wanted = rung.map(bare);
    const used = new Set<number>();
    for (const w of wanted) {
      const i = words.findIndex((word, idx) => !used.has(idx) && bare(word) === w);
      if (i >= 0) { out.add(i); used.add(i); }
    }

    // Curated metadata is authoritative. Topping it up to hit a proportion
    // would open more gaps than the caller has words to fill — the fallback
    // below exists for verses with no metadata at all, not as a supplement.
    if (omissions.length) return out;

    const target = Math.round(words.length * (1 - assistance));
    if (out.size < target) {
      const candidates = words
        .map((w, i) => ({ w: bare(w), i }))
        .filter(({ w, i }) => w.length > 2 && !FUNCTION_WORDS.has(w) && !out.has(i));

      // Spread them through the verse rather than clustering at the front.
      const need = target - out.size;
      const stride = Math.max(1, Math.floor(candidates.length / Math.max(need, 1)));
      for (let k = 0; k < candidates.length && out.size < target; k += stride) {
        out.add(candidates[k].i);
      }
    }

    return out;
  }, [words, assistance, omissions, notice]);

  const lit = useMemo(() => new Set(emphasis.map(bare)), [emphasis]);

  /** Blank positions in reading order, so answers fill left to right. */
  const blankOrder = useMemo(() => [...hidden].sort((a, b) => a - b), [hidden]);

  // Reference-only recall.
  if (assistance <= 0) {
    return (
      <View style={styles.wrap}>
        <Text variant="reference" uppercase style={{ color: t.colors.accent }}>
          {reference}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text
        variant="scripture"
        style={{ color: t.colors.onImmersive, fontSize: size, lineHeight: size * 1.7 }}
      >
        {words.map((word, i) => {
          if (hidden.has(i)) {
            const slot = blankOrder.indexOf(i);
            const answered = slot > -1 && slot < filled.length;

            // Once supplied, the word appears in gold where it belongs — the
            // verse reassembles as you go rather than staying blank until the
            // end.
            if (answered) {
              return (
                <RNText key={i} style={{ color: t.colors.accent }}>
                  {filled[slot]}{' '}
                </RNText>
              );
            }

            // A blank the width of the word it replaces, so the shape of the
            // sentence survives even when the word does not.
            return (
              <RNText key={i} style={{ color: 'transparent' }}>
                {word.replace(/[A-Za-z’']/g, '\u2009\u2009')}{' '}
              </RNText>
            );
          }
          const illuminated = notice && lit.has(bare(word));
          // Plain RN Text for the spans: the Text primitive applies the theme's
          // default colour to every instance, which would override the colour
          // set on the parent and leave ink-on-ink.
          return (
            <RNText
              key={i}
              style={illuminated ? { color: t.colors.accent } : undefined}
            >
              {word}{' '}
            </RNText>
          );
        })}
      </Text>

      {/* Scripture always carries its reference — knowing where a verse sits is
          half of knowing it. */}
      {showReference && (
        <Text variant="reference" uppercase style={[styles.reference, { color: t.colors.accent }]}>
          {reference}
        </Text>
      )}

      {/* The blanks are drawn under the text as faint gold rules — stippling
          rather than a gap, so the page still reads as a verse. */}
      {hidden.size > 0 && (
        <Animated.View entering={FadeIn.duration(400)} pointerEvents="none" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  reference: { marginTop: 20, opacity: 0.85 },
});
