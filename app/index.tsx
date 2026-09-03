import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';
import { WELCOME_KEY } from './welcome';

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
    AsyncStorage.multiGet(['manna_user', WELCOME_KEY])
      .then((pairs) => {
        const map = Object.fromEntries(pairs);
        if (!map['manna_user']) { setTarget('/(auth)/login'); return; }
        // The walkthrough runs once, after signing in rather than before —
        // explaining the modes to someone who has not decided to stay is the
        // wrong order.
        setTarget(map[WELCOME_KEY] ? '/(tabs)/today' : '/welcome');
      })
      .catch(() => setTarget('/(auth)/login'));
  }, []);

  // A blank field in the theme colour while storage is read — a flash of
  // anything else here reads as yet another splash screen.
  if (!target) return <View style={{ flex: 1, backgroundColor: t.colors.background }} />;

  return <Redirect href={target as never} />;
}
