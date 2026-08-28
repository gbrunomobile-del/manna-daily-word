import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../primitives/Text';
import { useTheme } from '@/theme';
import type { ScripturePassage } from '@/types';
import { TRANSLATIONS } from '@/data/scripture/translations';

type Props = {
  passage: ScripturePassage;
  size?: 'large' | 'normal';
  /** Illuminate marked words with a soft ground. Emphasis only. */
  illuminate?: boolean;
  onDark?: boolean;
  showTranslation?: boolean;
};

/**
 * Renders verbatim Scripture. This component accepts ScripturePassage only —
 * commentary cannot reach it, so commentary can never be styled as Scripture.
 */
export const ScriptureText = ({
  passage, size = 'large', illuminate = true, onDark, showTranslation,
}: Props) => {
  const t = useTheme();
  const variant = size === 'large' ? 'scriptureLarge' : 'scripture';

  const parts = useMemo(() => {
    const marks = passage.illuminate;
    if (!illuminate || !marks || marks.length === 0) return [{ text: passage.text, lit: false }];

    const escaped = marks.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${escaped.join('|')})`, 'gi');
    return passage.text
      .split(re)
      .filter((s) => s.length > 0)
      .map((s) => ({ text: s, lit: marks.some((m) => m.toLowerCase() === s.toLowerCase()) }));
  }, [passage, illuminate]);

  const color = onDark ? '#EEE9DD' : t.colors.scripture;

  return (
    <View>
      <Text variant={variant} style={{ color }} accessibilityLabel={passage.text}>
        {parts.map((p, i) =>
          p.lit ? (
            <Text
              key={i}
              variant={variant}
              style={{
                color,
                backgroundColor: onDark ? 'rgba(215,173,90,0.20)' : t.colors.illumination,
              }}
            >
              {p.text}
            </Text>
          ) : (
            <Text key={i} variant={variant} style={{ color }}>{p.text}</Text>
          ),
        )}
      </Text>
      {showTranslation ? (
        <Text variant="caption" tone={onDark ? 'muted' : 'muted'} style={styles.translation}>
          {TRANSLATIONS[passage.translation].abbreviation}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({ translation: { marginTop: 14, letterSpacing: 1 } });
