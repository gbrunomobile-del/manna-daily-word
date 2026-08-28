import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, Lock } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme, MIN_TOUCH } from '@/theme';
import type { JourneyNodeState } from '@/types';

export type ThreadNode = {
  id: string;
  label: string;
  caption?: string;
  state: JourneyNodeState;
  onPress?: () => void;
};

/**
 * THE JOURNEY THREAD.
 * A single illuminated line travelling down the page. Completed thread is
 * gold; what lies ahead is drawn but unlit.
 */
export const JourneyThread = ({ nodes }: { nodes: readonly ThreadNode[] }) => {
  const t = useTheme();

  return (
    <View>
      {nodes.map((n, i) => {
        const done = n.state === 'completed';
        const current = n.state === 'current';
        const locked = n.state === 'locked';
        const lit = done || current;
        const last = i === nodes.length - 1;

        return (
          <Animated.View
            key={n.id}
            entering={t.reduceMotion ? undefined : FadeInDown.delay(i * 70).duration(600)}
            style={styles.row}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.node,
                  {
                    borderColor: lit ? t.colors.accent : t.colors.border,
                    backgroundColor: done ? t.colors.accent : current ? t.colors.accentSoft : t.colors.surface,
                    width: current ? 34 : 24,
                    height: current ? 34 : 24,
                    borderRadius: current ? 17 : 12,
                    borderWidth: current ? 2 : 1.5,
                  },
                ]}
              >
                {done ? <Check size={13} color={t.colors.onAccent} strokeWidth={2.6} /> : null}
                {locked ? <Lock size={11} color={t.colors.textMuted} strokeWidth={1.8} /> : null}
              </View>
              {!last ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: done ? t.colors.accent : t.colors.border, opacity: done ? 0.85 : 1 },
                  ]}
                />
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={n.label}
              accessibilityState={{ disabled: locked }}
              disabled={locked || !n.onPress}
              onPress={n.onPress}
              style={styles.body}
            >
              <Text
                variant={current ? 'h2' : 'h3'}
                tone={locked ? 'muted' : 'primary'}
              >
                {n.label}
              </Text>
              {n.caption ? (
                <Text variant="bodySmall" tone="muted" style={styles.caption}>{n.caption}</Text>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 18 },
  rail: { alignItems: 'center', width: 34 },
  node: { alignItems: 'center', justifyContent: 'center' },
  line: { width: 1.5, flex: 1, minHeight: 44, marginVertical: 4 },
  body: { flex: 1, paddingBottom: 34, paddingTop: 1, minHeight: MIN_TOUCH },
  caption: { marginTop: 4 },
});
