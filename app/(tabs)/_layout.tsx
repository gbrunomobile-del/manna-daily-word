import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sunrise, Route, BookOpen, Compass, Flame } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';

/**
 * Five destinations. “You” is deliberately absent — it lives as a profile
 * mark in the top right of Today, which keeps the bar to the number iOS is
 * comfortable with and gives the fifth slot to something used daily.
 */
const ICONS = { today: Sunrise, journey: Route, bible: BookOpen, way: Compass, treasure: Flame } as const;
const LABELS = { today: 'Today', journey: 'Journey', bible: 'Bible', way: 'The Way', treasure: 'Treasure' } as const;
type TabKey = keyof typeof ICONS;

type TabBarProps = {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const TabBar = ({ state, navigation }: TabBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const item = (
    key: string,
    Icon: typeof Sunrise,
    label: string,
    focused: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={key}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.item}
    >
      <Icon
        size={20}
        strokeWidth={focused ? 1.9 : 1.4}
        color={focused ? t.colors.accent : t.colors.textMuted}
        opacity={focused ? 1 : 0.55}
      />
      <Text
        variant="caption"
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: focused ? t.colors.textPrimary : t.colors.textMuted,
            fontFamily: focused ? t.fonts.sansSemi : t.fonts.sans,
            // Inactive items recede: the bar should tell you where you are
            // without listing where you are not.
            opacity: focused ? 1 : 0.58,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

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
        return item(route.key, Icon, LABELS[key], focused, () => {
          feedback.select();
          if (!focused) navigation.navigate(route.name);
        });
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
      <Tabs.Screen name="way" />
      <Tabs.Screen name="treasure" />
      {/* Still a route, reached from the profile mark on Today rather than the bar. */}
      <Tabs.Screen name="you" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Sits on the paper rather than on a bar: a hairline rule, no fill change,
  // no container behind the active icon.
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 13 },
  item: { flex: 1, alignItems: 'center', gap: 6, minHeight: MIN_TOUCH },
  label: { fontSize: 10.5, letterSpacing: 0.3 },
});
