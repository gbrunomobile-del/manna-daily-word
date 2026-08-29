import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { useProgress } from '@/store/progress';

const { width: W } = Dimensions.get('window');

// ── Skill tree data ───────────────────────────────────────────────────────────

interface Skill {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  row: number;
  col: number; // 0=left, 1=centre, 2=right
  unlocksAfter: string[];
  questionCount: number;
}

const SKILLS: Skill[] = [
  // Row 1 — Foundation
  { id:'creation',    title:'Creation',    subtitle:'In the beginning',       icon:'🌍', row:1, col:1, unlocksAfter:[], questionCount:5 },
  // Row 2
  { id:'the-fall',    title:'The Fall',    subtitle:'Paradise lost',           icon:'🍎', row:2, col:0, unlocksAfter:['creation'], questionCount:5 },
  { id:'noah',        title:'Noah',        subtitle:'The great flood',         icon:'🌊', row:2, col:2, unlocksAfter:['creation'], questionCount:5 },
  // Row 3
  { id:'abraham',     title:'Abraham',     subtitle:'Father of faith',         icon:'⭐', row:3, col:1, unlocksAfter:['the-fall','noah'], questionCount:5 },
  // Row 4
  { id:'joseph',      title:'Joseph',      subtitle:'The dreamer',             icon:'🌈', row:4, col:0, unlocksAfter:['abraham'], questionCount:5 },
  { id:'moses',       title:'Moses',       subtitle:'Let my people go',        icon:'🔥', row:4, col:2, unlocksAfter:['abraham'], questionCount:5 },
  // Row 5
  { id:'the-law',     title:'The Law',     subtitle:"God's commands",          icon:'📜', row:5, col:1, unlocksAfter:['joseph','moses'], questionCount:5 },
  // Row 6
  { id:'david',       title:'David',       subtitle:"A man after God's heart", icon:'👑', row:6, col:0, unlocksAfter:['the-law'], questionCount:5 },
  { id:'isaiah',      title:'Isaiah',      subtitle:'The gospel prophet',      icon:'📣', row:6, col:2, unlocksAfter:['the-law'], questionCount:5 },
  // Row 7
  { id:'birth',       title:'Birth of Jesus', subtitle:'The Word became flesh',icon:'✨', row:7, col:1, unlocksAfter:['david','isaiah'], questionCount:5 },
  // Row 8
  { id:'ministry',    title:'Ministry',    subtitle:'The Kingdom is near',     icon:'✝️', row:8, col:0, unlocksAfter:['birth'], questionCount:5 },
  { id:'miracles',    title:'Miracles',    subtitle:'Signs and wonders',       icon:'💧', row:8, col:2, unlocksAfter:['birth'], questionCount:5 },
  // Row 9
  { id:'cross',       title:'Death & Resurrection', subtitle:'It is finished', icon:'🌅', row:9, col:1, unlocksAfter:['ministry','miracles'], questionCount:5 },
  // Row 10
  { id:'acts',        title:'Acts',        subtitle:'The Spirit comes',        icon:'🕊️', row:10, col:0, unlocksAfter:['cross'], questionCount:5 },
  { id:'letters',     title:"Paul's Letters", subtitle:'Grace & truth',        icon:'📖', row:10, col:2, unlocksAfter:['cross'], questionCount:5 },
  // Row 11
  { id:'revelation',  title:'Revelation',  subtitle:'The Lamb wins',           icon:'👁️', row:11, col:1, unlocksAfter:['acts','letters'], questionCount:5 },
];

const MAX_ROWS = 11;
const COL_POS = [0.15, 0.5, 0.85]; // fraction of width

// ── State helpers ─────────────────────────────────────────────────────────────

function isUnlocked(skill: Skill, completed: string[]): boolean {
  if (skill.unlocksAfter.length === 0) return true;
  return skill.unlocksAfter.every(id => completed.includes(id));
}

function getStatus(skill: Skill, completed: string[], inProgress: string[]): 'locked' | 'available' | 'in-progress' | 'complete' {
  if (completed.includes(skill.id)) return 'complete';
  if (!isUnlocked(skill, completed)) return 'locked';
  if (inProgress.includes(skill.id)) return 'in-progress';
  return 'available';
}

// ── Skill node ────────────────────────────────────────────────────────────────

const NODE_SIZE = 72;

interface NodeProps {
  skill: Skill;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  onPress: () => void;
  colors: any;
}

const SkillNode = ({ skill, status, onPress, colors }: NodeProps) => {
  const locked = status === 'locked';
  const complete = status === 'complete';
  const available = status === 'available';

  const bg = complete
    ? colors.accent
    : available
    ? colors.surface
    : colors.background;

  const border = complete
    ? colors.accent
    : available
    ? colors.border
    : colors.border + '44';

  const iconOpacity = locked ? 0.3 : 1;

  return (
    <Pressable
      onPress={() => { if (!locked) { feedback.select(); onPress(); } }}
      style={[
        styles.node,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: complete ? 0 : 1.5,
          shadowColor: available ? colors.accent : 'transparent',
          shadowOpacity: available ? 0.18 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: available ? 4 : 0,
        },
      ]}
    >
      <Text style={{ fontSize: 26, opacity: iconOpacity }}>{skill.icon}</Text>
      {complete && (
        <View style={[styles.checkBadge, { backgroundColor: colors.background }]}>
          <Text style={{ fontSize: 9, color: colors.accent }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};

// ── Connector line ────────────────────────────────────────────────────────────

const Connector = ({ color }: { color: string }) => (
  <View style={[styles.connector, { backgroundColor: color + '30' }]} />
);

// ── Main screen ───────────────────────────────────────────────────────────────

export default function TheWay() {
  const t = useTheme();
  const router = useRouter();
  const { wayCompleted = [], wayInProgress = [], daysGathered } = useProgress() as any;

  // Group skills by row
  const rows = Array.from({ length: MAX_ROWS }, (_, i) =>
    SKILLS.filter(s => s.row === i + 1)
  );

  const totalCompleted = wayCompleted.length;
  const totalSkills = SKILLS.length;
  const xp = totalCompleted * 50;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={[styles.header, { borderBottomColor: t.colors.border + '44' }]}>
        <View>
          <Text variant="title" style={{ color: t.colors.text }}>The Way</Text>
          <Text variant="body" tone="muted" style={{ marginTop: 2 }}>
            {totalCompleted}/{totalSkills} topics gathered
          </Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: t.colors.accent + '18', borderColor: t.colors.accent + '40' }]}>
          <Text style={{ color: t.colors.accent, fontSize: 13, fontWeight: '700' }}>
            {xp} XP
          </Text>
        </View>
      </Animated.View>

      {/* Skill tree */}
      <ScrollView
        contentContainerStyle={styles.tree}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((rowSkills, rowIdx) => {
          if (rowSkills.length === 0) return null;
          return (
            <Animated.View
              key={rowIdx}
              entering={FadeInDown.delay(rowIdx * 60).duration(400)}
              style={styles.row}
            >
              {rowSkills.map(skill => {
                const status = getStatus(skill, wayCompleted, wayInProgress);
                const x = COL_POS[skill.col] * W;
                return (
                  <View key={skill.id} style={[styles.nodeWrapper, { left: x - NODE_SIZE / 2 }]}>
                    <SkillNode
                      skill={skill}
                      status={status}
                      onPress={() => router.push({ pathname: '/way/lesson', params: { skillId: skill.id } })}
                      colors={t.colors}
                    />
                    <Text
                      variant="caption"
                      style={[
                        styles.nodeLabel,
                        { color: status === 'locked' ? t.colors.textMuted + '55' : t.colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {skill.title}
                    </Text>
                  </View>
                );
              })}
              {/* Connectors between rows */}
              {rowIdx < rows.length - 1 && rows[rowIdx + 1].length > 0 && (
                <View style={styles.connectorRow}>
                  <Connector color={t.colors.accent} />
                </View>
              )}
            </Animated.View>
          );
        })}

        {/* Bottom padding */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  xpBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  tree: {
    paddingTop: 32, paddingHorizontal: 0,
  },
  row: {
    height: 120, position: 'relative', width: '100%',
  },
  nodeWrapper: {
    position: 'absolute', alignItems: 'center', gap: 6,
  },
  node: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeLabel: {
    fontSize: 10.5, letterSpacing: 0.2, maxWidth: NODE_SIZE + 20, textAlign: 'center',
  },
  connectorRow: {
    position: 'absolute', bottom: 0, left: '50%', marginLeft: -1,
  },
  connector: {
    width: 2, height: 24, borderRadius: 1,
  },
});
