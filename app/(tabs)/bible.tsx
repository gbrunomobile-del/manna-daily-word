import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Search, Link2 } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Pill } from '@/components/primitives/Pill';
import { ScriptureText } from '@/components/scripture/ScriptureText';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';
import { useTheme, MIN_TOUCH } from '@/theme';
import { PASSAGES } from '@/data/scripture/passages';
import { connectionsFor } from '@/data/connections/connections';
import { feedback } from '@/services/feedback';

const READING = ['john-6-31', 'john-6-32-33', 'john-6-35'] as const;

export default function Bible() {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const connections = connectionsFor('John', 6);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.gutter, paddingBottom: t.spacing.huge }}
      >
        <Text variant="reference" tone="muted" uppercase style={styles.eyebrow}>World English Bible</Text>
        <Text variant="hero" style={styles.title}>John 6</Text>

        <View
          style={[
            styles.search,
            { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.pill },
          ]}
        >
          <Search size={17} color={t.colors.textMuted} strokeWidth={1.7} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Scripture"
            placeholderTextColor={t.colors.textMuted}
            style={[styles.input, { color: t.colors.textPrimary, fontFamily: t.fonts.sans }]}
            accessibilityLabel="Search Scripture"
          />
        </View>

        <View style={styles.reading}>
          {READING.map((id) => {
            const p = PASSAGES[id];
            if (!p) return null;
            const active = selected === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={p.text}
                onPress={() => { feedback.select(); setSelected(active ? null : id); }}
                style={[
                  styles.verse,
                  {
                    borderLeftColor: active ? t.colors.accent : 'transparent',
                    backgroundColor: active ? t.colors.surface : 'transparent',
                    borderRadius: t.radius.sm,
                  },
                ]}
              >
                <ScriptureReference refValue={p.ref} tone={active ? 'accent' : 'muted'} />
                <View style={styles.verseText}>
                  <ScriptureText passage={p} size="normal" illuminate={false} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {selected ? (
          <Card style={styles.actions}>
            <Text variant="reference" tone="muted" uppercase>Verse actions</Text>
            <View style={styles.actionRow}>
              {['Save', 'Remember this', 'Explain context', 'Show connections'].map((a) => (
                <Pill key={a} label={a} tone="neutral" style={styles.actionPill} />
              ))}
            </View>
          </Card>
        ) : null}

        {connections.length > 0 ? (
          <View style={styles.connections}>
            <View style={styles.connHead}>
              <Link2 size={16} color={t.colors.accent} strokeWidth={1.8} />
              <Text variant="reference" tone="accent" uppercase>Connections in this chapter</Text>
            </View>
            {connections.map((c) => (
              <Card key={c.id} style={styles.connCard}>
                <Text variant="h3">
                  {c.source.book} {c.source.chapter} ↔ {c.target.book} {c.target.chapter}
                </Text>
                <Text variant="body" tone="secondary" style={styles.connSummary}>{c.summary}</Text>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  eyebrow: { paddingTop: 14 },
  title: { marginTop: 10, marginBottom: 20 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16,
    minHeight: MIN_TOUCH, borderWidth: StyleSheet.hairlineWidth * 2,
  },
  input: { flex: 1, fontSize: 15 },
  reading: { marginTop: 30, gap: 20 },
  verse: { borderLeftWidth: 2, paddingLeft: 14, paddingVertical: 8 },
  verseText: { marginTop: 8 },
  actions: { marginTop: 24 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  actionPill: {},
  connections: { marginTop: 34, gap: 12 },
  connHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  connCard: {},
  connSummary: { marginTop: 8 },
});
