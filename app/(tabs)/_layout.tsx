import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sunrise, Route, BookOpen, User } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';

const ICONS = { today: Sunrise, journey: Route, bible: BookOpen, you: User } as const;
const LABELS = { today: 'Today', journey: 'Journey', bible: 'Bible', you: 'You' } as const;
type TabKey = keyof typeof ICONS;

/** Structural props — avoids coupling to a specific @react-navigation version. */
type TabBarProps = {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const TabBar = ({ state, navigation }: TabBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.colors.background,
          borderTopColor: t.colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const key = route.name as TabKey;
        const Icon = ICONS[key];
        if (!Icon) return null;
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={LABELS[key]}
            onPress={() => {
              feedback.select();
              if (!focused) navigation.navigate(route.name);
            }}
            style={styles.item}
          >
            <Icon
              size={21}
              strokeWidth={focused ? 2 : 1.6}
              color={focused ? t.colors.accent : t.colors.textMuted}
            />
            <Text
              variant="caption"
              tone={focused ? 'primary' : 'muted'}
              style={[styles.label, focused ? { fontFamily: t.fonts.sansSemi } : null]}
            >
              {LABELS[key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <TabBar state={p.state} navigation={p.navigation} />}>
      <Tabs.Screen name="today" />
      <Tabs.Screen name="journey" />
      <Tabs.Screen name="bible" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 11 },
  item: { flex: 1, alignItems: 'center', gap: 5, minHeight: MIN_TOUCH },
  label: { fontSize: 10.5, letterSpacing: 0.2 },
});
