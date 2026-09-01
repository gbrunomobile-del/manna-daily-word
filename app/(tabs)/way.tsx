import React, { useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Check, Lock } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { ScreenHeader } from '@/components/manna/ScreenHeader';
import { SCREEN_ART, TOPIC_ART } from '@/components/manna/screen-art';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { useWay } from '@/store/way';

const { width: W } = Dimensions.get('window');

const NODE = 112;          // large enough for a detailed engraving to read
const ROW_H = 168;
const LANES = [0.24, 0.5, 0.76];   // left, centre, right — as a fraction of width

/**
 * Art now lives in screen-art so the tree, Today and the lesson environment
 * all draw from one place.
 */
const ART = TOPIC_ART;

interface Skill {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  lane: 0 | 1 | 2;
  unlocksAfter: string[];
}

/** One topic per row, zigzagging down the page. */
const SKILLS: Skill[] = [
  { id: 'creation',   title: 'Creation',            subtitle: 'In the beginning',       emoji: '🌍', lane: 1, unlocksAfter: [] },
  { id: 'the-fall',   title: 'The Fall',            subtitle: 'Paradise lost',          emoji: '🍎', lane: 0, unlocksAfter: ['creation'] },
  { id: 'noah',       title: 'Noah',                subtitle: 'The great flood',        emoji: '🌊', lane: 2, unlocksAfter: ['the-fall'] },
  { id: 'abraham',    title: 'Abraham',             subtitle: 'Father of faith',        emoji: '⭐', lane: 1, unlocksAfter: ['noah'] },
  { id: 'joseph',     title: 'Joseph',              subtitle: 'The dreamer',            emoji: '🌈', lane: 0, unlocksAfter: ['abraham'] },
  { id: 'moses',      title: 'Moses',               subtitle: 'Let my people go',       emoji: '🔥', lane: 2, unlocksAfter: ['joseph'] },
  { id: 'the-law',    title: 'The Law',             subtitle: "God's commands",         emoji: '📜', lane: 1, unlocksAfter: ['moses'] },
  { id: 'david',      title: 'David',               subtitle: "A man after God's heart", emoji: '👑', lane: 0, unlocksAfter: ['the-law'] },
  { id: 'isaiah',     title: 'Isaiah',              subtitle: 'The gospel prophet',     emoji: '📣', lane: 2, unlocksAfter: ['david'] },
  { id: 'birth',      title: 'Birth of Jesus',      subtitle: 'The Word became flesh',  emoji: '✨', lane: 1, unlocksAfter: ['isaiah'] },
  { id: 'ministry',   title: 'Ministry',            subtitle: 'The Kingdom is near',    emoji: '✝️', lane: 0, unlocksAfter: ['birth'] },
  { id: 'miracles',   title: 'Miracles',            subtitle: 'Signs and wonders',      emoji: '💧', lane: 2, unlocksAfter: ['ministry'] },
  { id: 'cross',      title: 'Death & Resurrection', subtitle: 'It is finished',        emoji: '🌅', lane: 1, unlocksAfter: ['miracles'] },
  { id: 'acts',       title: 'Acts',                subtitle: 'The Spirit comes',       emoji: '🕊️', lane: 0, unlocksAfter: ['cross'] },
  { id: 'letters',    title: "Paul's Letters",      subtitle: 'Grace and truth',        emoji: '📖', lane: 2, unlocksAfter: ['acts'] },
  { id: 'revelation', title: 'Revelation',          subtitle: 'The Lamb wins',          emoji: '👁️', lane: 1, unlocksAfter: ['letters'] },
];

type Status = 'locked' | 'available' | 'attempted' | 'complete';

function statusOf(skill: Skill, completed: string[], attempted: string[]): Status {
  if (completed.includes(skill.id)) return 'complete';
  const unlocked = skill.unlocksAfter.every((id) => completed.includes(id));
  if (!unlocked) return 'locked';
  return attempted.includes(skill.id) ? 'attempted' : 'available';
}

/**
 * The thread between two topics.
 *
 * Drawn as a shallow S-curve rather than a straight rule, because the nodes
 * zigzag and a vertical bar joined nothing. Gold once the topic above it is
 * gathered, so the path fills in behind you as you go.
 */
const Thread = ({ fromX, toX, lit, colour }: {
  fromX: number; toX: number; lit: boolean; colour: string;
}) => {
  const h = ROW_H - NODE + 34;
  // Control points pulled vertically give a slack, hand-drawn fall rather than
  // the taut arc of a game path.
  const d = `M ${fromX} 0 C ${fromX} ${h * 0.45}, ${toX} ${h * 0.55}, ${toX} ${h}`;
  return (
    <Svg width={W} height={h} style={styles.thread} pointerEvents="none">
      <Path
        d={d}
        stroke={colour}
        strokeWidth={lit ? 2 : 1.5}
        strokeOpacity={lit ? 0.75 : 0.28}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={lit ? undefined : '5 7'}
      />
    </Svg>
  );
};

export default function TheWay() {
  const t = useTheme();
  const router = useRouter();
  const { completed, attempted, xp, hydrate, hydrated } = useWay();

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  /** Where you are now: the first topic open to you but not yet gathered. */
  const currentId = SKILLS.find(
    (sk) => !completed.includes(sk.id) && sk.unlocksAfter.every((id) => completed.includes(id)),
  )?.id;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { borderBottomColor: t.colors.border + '55' }]}
      >
        <View>
          <Text variant="title" style={{ color: t.colors.text }}>The Way</Text>
          <Text variant="body" tone="muted" style={{ marginTop: 2 }}>
            {completed.length} of {SKILLS.length} topics gathered
          </Text>
        </View>
        <View style={[styles.xp, { backgroundColor: t.colors.accent + '18', borderColor: t.colors.accent + '44' }]}>
          <Text variant="caption" style={{ color: t.colors.accent, fontFamily: t.fonts.sansSemi }}>
            {xp} XP
          </Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.tree} showsVerticalScrollIndicator={false}>
        {SCREEN_ART.way && (
          <View style={styles.treeHeader}>
            <ScreenHeader art={SCREEN_ART.way} caption="The Way" title="Learn the story" eyebrow="Sixteen topics" />
          </View>
        )}
        {SKILLS.map((skill, i) => {
          const status = statusOf(skill, completed, attempted);
          const locked = status === 'locked';
          const complete = status === 'complete';
          const current = skill.id === currentId;
          const art = ART[skill.id];

          const x = LANES[skill.lane] * W;
          const next = SKILLS[i + 1];

          return (
            <Animated.View
              key={skill.id}
              entering={FadeInDown.delay(Math.min(i, 8) * 55).duration(420)}
              style={styles.row}
            >
              {/* Thread to the next topic */}
              {next && (
                <Thread
                  fromX={x}
                  toX={LANES[next.lane] * W}
                  lit={complete}
                  colour={complete ? t.colors.accent : t.colors.textMuted}
                />
              )}

              <View style={[styles.nodeWrap, { left: x - NODE / 2 }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={locked ? `${skill.title}, locked` : skill.title}
                  accessibilityState={{ disabled: locked }}
                  disabled={locked}
                  onPress={() => {
                    feedback.select();
                    router.push({ pathname: '/way/lesson', params: { skillId: skill.id } });
                  }}
                  style={[
                    styles.node,
                    // With transparent artwork the engraving sits straight on the
                    // page; the card chrome is only needed behind an emoji.
                    art
                      ? { opacity: locked ? 0.3 : complete ? 0.92 : 1 }
                      : {
                          backgroundColor: t.colors.surface,
                          borderColor: complete
                            ? t.colors.accent
                            : locked
                            ? t.colors.border + '55'
                            : t.colors.border,
                          borderWidth: complete ? 2 : 1,
                          borderRadius: 26,
                          overflow: 'hidden',
                          opacity: locked ? 0.42 : 1,
                        },
                  ]}
                >
                  {art ? (
                    <>
                      {/* A ring of light around the topic you are on now. */}
                      {current && (
                        <View
                          style={[
                            styles.focus,
                            { borderColor: t.colors.accent, backgroundColor: t.colors.accent + '10' },
                          ]}
                          pointerEvents="none"
                        />
                      )}
                      <Image source={art} style={styles.art} resizeMode="contain" />
                    </>
                  ) : (
                    <Text style={styles.emoji}>{skill.emoji}</Text>
                  )}

                  {complete && (
                    <View style={[styles.badge, { backgroundColor: t.colors.accent }]}>
                      <Check size={13} color={t.colors.background} strokeWidth={2.6} />
                    </View>
                  )}
                  {locked && (
                    <View style={[styles.badge, { backgroundColor: t.colors.border }]}>
                      <Lock size={11} color={t.colors.textMuted} strokeWidth={2.2} />
                    </View>
                  )}
                </Pressable>

                <Text
                  variant="body"
                  style={[
                    styles.title,
                    { color: locked ? t.colors.textMuted : t.colors.text,
                      fontFamily: complete || current ? t.fonts.sansSemi : t.fonts.sans },
                  ]}
                  numberOfLines={1}
                >
                  {skill.title}
                </Text>
                <Text variant="caption" tone="muted" style={styles.subtitle} numberOfLines={1}>
                  {skill.subtitle}
                </Text>
              </View>
            </Animated.View>
          );
        })}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  xp: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  tree: { paddingTop: 28 },
  treeHeader: { paddingHorizontal: 24, paddingBottom: 34 },
  row: { height: ROW_H, width: '100%', position: 'relative' },
  thread: { position: 'absolute', left: 0, top: NODE - 14 },
  nodeWrap: { position: 'absolute', width: NODE + 40, alignItems: 'center', marginLeft: -20 },
  node: {
    width: NODE, height: NODE,
    alignItems: 'center', justifyContent: 'center',
  },
  art: { width: '100%', height: '100%' },
  focus: {
    position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: (NODE + 12) / 2, borderWidth: 1.5,
  },
  emoji: { fontSize: 40 },
  badge: {
    position: 'absolute', bottom: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { marginTop: 10, fontSize: 15, textAlign: 'center' },
  subtitle: { marginTop: 1, textAlign: 'center', fontSize: 11 },
});
