import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Pill } from '@/components/primitives/Pill';
import { GatheredVessel } from '@/components/manna/GatheredVessel';
import { useTheme } from '@/theme';
import { useProgress } from '@/store/progress';
import { PASSAGES } from '@/data/scripture/passages';
import { getLesson } from '@/data/lessons';
import { feedback } from '@/services/feedback';
import { track } from '@/services/analytics';
import { formatRef } from '@/types';

const INK = '#111612';
const IVORY = '#EEE9DD';

export default function Gathered() {
  const t = useTheme();
  const router = useRouter();
  const { lessonId, seconds } = useLocalSearchParams<{ lessonId: string; seconds: string }>();
  const gather = useProgress((s) => s.gather);
  const daysGathered = useProgress((s) => s.daysGathered);

  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const secs = Number(seconds ?? '0');
  const minutes = Math.max(1, Math.round(secs / 60));
  const closing = lesson ? PASSAGES[lesson.closingPassageId] : undefined;

  useEffect(() => {
    feedback.gathered();
    if (lessonId) {
      void gather(lessonId, secs);
      track({ name: 'daily_manna_gathered', lessonId, seconds: secs });
    }
    // Runs once on completion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: INK }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={[styles.body, { paddingHorizontal: t.gutter }]}>
        <View style={styles.vessel}>
          <GatheredVessel size={210} />
        </View>

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(1500).duration(900)}
          style={styles.center}
        >
          <Text variant="display" style={{ color: IVORY }}>Gathered.</Text>
          <Text variant="body" style={[styles.sub, { color: 'rgba(238,233,221,0.62)' }]}>
            You spent {minutes} {minutes === 1 ? 'minute' : 'minutes'} in the Word today.
          </Text>
        </Animated.View>

        {closing ? (
          <Animated.View
            entering={t.reduceMotion ? undefined : FadeIn.delay(2000).duration(900)}
            style={styles.center}
          >
            <Text variant="scripture" style={[styles.verse, { color: 'rgba(238,233,221,0.9)' }]}>
              “{closing.text}”
            </Text>
            <Text variant="reference" uppercase style={{ color: 'rgba(238,233,221,0.45)' }}>
              {formatRef(closing.ref)}
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.delay(2400).duration(800)}
          style={styles.footer}
        >
          <Pill label={`${daysGathered} days gathered`} tone="onDark" style={styles.pill} />
          <Button label="Continue" variant="onDark" onPress={() => router.replace('/(tabs)/today')} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, justifyContent: 'space-between', paddingTop: 18, paddingBottom: 12 },
  vessel: { alignItems: 'center', marginTop: 8 },
  center: { alignItems: 'center' },
  sub: { marginTop: 12, textAlign: 'center' },
  verse: { textAlign: 'center', marginBottom: 14, paddingHorizontal: 10 },
  footer: { gap: 18, alignItems: 'stretch' },
  pill: { alignSelf: 'center' },
});
