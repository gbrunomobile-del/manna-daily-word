import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';

/**
 * Entry route.
 *
 * No splash of its own: the native splash already covers the launch, and a
 * second animated one on top of it just delays getting into the app. This
 * only decides where to send you once storage has been read.
 */
export default function Index() {
  const t = useTheme();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('manna_user')
      .then((user) => setTarget(user ? '/(tabs)/today' : '/(auth)/login'))
      .catch(() => setTarget('/(auth)/login'));
  }, []);

  // A blank field in the theme colour while storage is read — a flash of
  // anything else here reads as yet another splash screen.
  if (!target) return <View style={{ flex: 1, backgroundColor: t.colors.background }} />;

  return <Redirect href={target as never} />;
}
