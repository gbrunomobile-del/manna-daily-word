import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { ThemeProvider, useTheme } from '@/theme';
import { useProgress } from '@/store/progress';

void SplashScreen.preventAutoHideAsync();

const Navigator = () => {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.colors.background },
        animation: 'fade',
        animationDuration: 260,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="gathered" options={{ animation: 'fade', animationDuration: 420 }} />
    </Stack>
  );
};

export default function RootLayout() {
  const hydrate = useProgress((s) => s.hydrate);
  const [loaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => { void hydrate(); }, [hydrate]);

  const onLayout = useCallback(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={{ flex: 1 }}>
            <Navigator />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
