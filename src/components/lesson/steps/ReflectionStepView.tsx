import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { MannaMark } from '@/components/manna/MannaMark';
import { useTheme } from '@/theme';

type Props = {
  statement: readonly string[];
  question: string;
  onAdvance: () => void;
};

/** Never forces personal input. Reflection stays private and optional. */
export const ReflectionStepView = ({ statement, question, onAdvance }: Props) => {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  return (
    <View style={styles.flex}>
      <View style={styles.body}>
        <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.duration(700)} style={styles.mark}>
          <MannaMark size={38} strokeWidth={1.7} />
        </Animated.View>

        <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(140).duration(800)}>
          <Text variant="reference" tone="muted" uppercase style={styles.eyebrow}>Today, remember</Text>
          {statement.map((line, i) => (
            <Text key={i} variant="h1" style={styles.line}>{line}</Text>
          ))}
        </Animated.View>

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(300).duration(800)}
          style={[styles.card, { borderColor: t.colors.border, borderRadius: t.radius.card, backgroundColor: t.colors.surface }]}
        >
          <Text variant="bodyLarge" tone="secondary">{question}</Text>
          {open ? (
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder="Only you will see this."
              placeholderTextColor={t.colors.textMuted}
              style={[
                styles.input,
                { color: t.colors.textPrimary, borderColor: t.colors.border, fontFamily: t.fonts.sans },
              ]}
            />
          ) : null}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {!open ? (
          <Button label="Reflect privately" variant="secondary" onPress={() => setOpen(true)} />
        ) : null}
        <Button label="Continue" onPress={onAdvance} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between' },
  body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  mark: { alignItems: 'center', marginBottom: 30 },
  eyebrow: { marginBottom: 16, textAlign: 'center' },
  line: { textAlign: 'center' },
  card: { marginTop: 38, padding: 22, borderWidth: StyleSheet.hairlineWidth * 2 },
  input: { marginTop: 16, minHeight: 88, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14, fontSize: 15.5, lineHeight: 24 },
  footer: { gap: 10 },
});
