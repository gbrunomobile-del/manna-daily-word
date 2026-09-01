import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
  text, assistance, reference, emphasis = [], omissions = [], notice = false, size = 22,
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

    // Below the curated ladder's reach, keep taking content words until the
    // proportion matches the requested assistance.
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
            // A blank the width of the word it replaces, so the shape of the
            // sentence survives even when the word does not.
            return (
              <Text key={i} style={{ color: 'transparent' }}>
                {word.replace(/[A-Za-z’']/g, '\u2009\u2009')}{' '}
              </Text>
            );
          }
          const illuminated = notice && lit.has(bare(word));
          return (
            <Text
              key={i}
              style={illuminated ? { color: t.colors.accent } : undefined}
            >
              {word}{' '}
            </Text>
          );
        })}
      </Text>

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
});
