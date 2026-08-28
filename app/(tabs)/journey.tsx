import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/primitives/Text';
import { JourneyThread, ThreadNode } from '@/components/journey/JourneyThread';
import { useTheme } from '@/theme';
import { useProgress } from '@/store/progress';

export default function Journey() {
  const t = useTheme();
  const router = useRouter();
  const completed = useProgress((s) => s.completedLessonIds);
  const breadDone = completed.includes('bread-of-life');

  const nodes: ThreadNode[] = [
    { id: 'creation', label: 'Creation', caption: 'In the beginning', state: 'completed' },
    { id: 'fall', label: 'Fall', caption: 'What was lost', state: 'completed' },
    { id: 'promise', label: 'Promise', caption: 'A word given', state: 'completed' },
    { id: 'covenant', label: 'Covenant', caption: 'A people formed', state: 'completed' },
    {
      id: 'exodus',
      label: 'Exodus',
      caption: breadDone ? 'Bread of Life · gathered' : 'Bread in the wilderness',
      state: breadDone ? 'completed' : 'current',
      onPress: () => router.push('/lesson/bread-of-life'),
    },
    { id: 'kingdom', label: 'Kingdom', caption: 'A throne and a shepherd', state: breadDone ? 'current' : 'available' },
    { id: 'prophets', label: 'Prophets', caption: 'Voices in the waiting', state: 'locked' },
    { id: 'messiah', label: 'Messiah', caption: 'The one promised', state: 'locked' },
    { id: 'cross', label: 'Cross', state: 'locked' },
    { id: 'resurrection', label: 'Resurrection', state: 'locked' },
    { id: 'spirit', label: 'Spirit', state: 'locked' },
    { id: 'church', label: 'Church', state: 'locked' },
    { id: 'new-creation', label: 'New Creation', state: 'locked' },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]} edges={['top']}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.gutter, paddingBottom: t.spacing.huge }}
      >
        <View style={styles.head}>
          <Text variant="reference" tone="accent" uppercase>Foundations</Text>
          <Text variant="hero" style={styles.title}>The Story of the Bible</Text>
          <Text variant="body" tone="secondary">
            One thread, from the garden to the city. You are in the wilderness.
          </Text>
        </View>
        <JourneyThread nodes={nodes} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { paddingTop: 14, paddingBottom: 34 },
  title: { marginTop: 12, marginBottom: 12 },
});
