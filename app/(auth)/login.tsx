import React, { useState, useCallback, useEffect } from 'react';
import {
  View, TextInput, Pressable, ScrollView, KeyboardAvoidingView,
  Platform, StyleSheet, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@/components/primitives/Text';
import { Ornament } from '@/components/manna/Ornament';
import { useTheme, MIN_TOUCH } from '@/theme';
import { feedback } from '@/services/feedback';

const { height: H } = Dimensions.get('window');
const PLATE_H = H * 0.52;

/**
 * The hero is treated as an illuminated plate rather than a background:
 * the engraving occupies the upper half and dissolves into the page, so
 * the wordmark and controls sit on solid ground with guaranteed contrast.
 * The wordmark is set in Instrument Serif, never baked into the image.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PLATE = require('../../assets/hero-manna.png');

export default function LoginScreen() {
  const t = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleReady, setAppleReady] = useState(false);

  // Apple sign-in exists only on iOS 13+, so the button is conditional.
  useEffect(() => {
    let alive = true;
    AppleAuthentication.isAvailableAsync()
      .then((ok) => { if (alive) setAppleReady(ok); })
      .catch(() => { /* leave the button hidden */ });
    return () => { alive = false; };
  }, []);

  /**
   * Apple returns the name and email on the FIRST authorisation only — every
   * later sign-in gives just the stable user id. So whatever arrives now has
   * to be persisted now; there is no second chance to ask for it.
   */
  const handleApple = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const existing = await AsyncStorage.getItem('manna_user');
      const prior = existing ? JSON.parse(existing) : {};
      const given = credential.fullName?.givenName;

      await AsyncStorage.setItem('manna_user', JSON.stringify({
        ...prior,
        appleUserId: credential.user,
        // Apple can withhold the real address; keep whatever we already had.
        email: credential.email ?? prior.email ?? '',
        name: given ?? prior.name ?? 'Friend',
      }));

      router.replace('/(tabs)/today');
    } catch (e: any) {
      // Cancelling is a normal outcome, not an error worth showing.
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        setError('Could not sign in with Apple. Please try again.');
      }
    }
  }, []);

  const handleEmail = useCallback(async () => {
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await AsyncStorage.setItem(
        'manna_user',
        JSON.stringify({ email, name: email.split('@')[0] }),
      );
      router.replace('/(tabs)/today');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const bg = t.colors.background;

  return (
    <View style={[styles.flex, { backgroundColor: bg }]}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />

      {/* Plate */}
      <View style={[styles.plate, { height: PLATE_H }]} pointerEvents="none">
        <Image source={PLATE} style={styles.plateImg} resizeMode="cover" />
        {/* Dissolve the dark foreground into the page */}
        <LinearGradient
          colors={['transparent', bg + '00', bg]}
          locations={[0, 0.55, 1]}
          style={styles.fade}
        />
      </View>

      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { paddingTop: PLATE_H * 0.78 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Wordmark */}
            <Animated.View entering={FadeIn.duration(900)} style={styles.wordmark}>
              <Ornament width={196} opacity={0.85} />
              <Text variant="hero" style={[styles.manna, { color: t.colors.text }]} uppercase>
                Manna
              </Text>
              <Ornament width={132} opacity={0.6} />
              <Text variant="reference" tone="muted" style={styles.dailyWord} uppercase>
                Daily Word
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250).duration(700)}>
              <Text variant="body" tone="muted" style={styles.tagline}>
                Gather truth. Daily.
              </Text>
            </Animated.View>

            {/* Sign-in */}
            <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.actions}>
              {!showEmail ? (
                <>
                  {appleReady && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                      buttonStyle={
                        t.scheme === 'dark'
                          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                      }
                      cornerRadius={14}
                      style={styles.appleBtn}
                      onPress={handleApple}
                    />
                  )}

                  {/* Google lands here once its OAuth client exists. */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => { feedback.select(); setShowEmail(true); }}
                    style={[styles.primaryBtn, { backgroundColor: t.colors.primary }]}
                  >
                    <Text variant="body" style={{ color: t.colors.onPrimary, fontFamily: t.fonts.sansSemi }}>
                      Continue with email
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/(auth)/register')}
                    style={styles.textBtn}
                  >
                    <Text variant="caption" style={{ color: t.colors.accent }}>
                      New here? Create an account
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: t.colors.surface,
                      borderColor: t.colors.border,
                      color: t.colors.text,
                    }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={t.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Email address"
                  />
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: t.colors.surface,
                      borderColor: t.colors.border,
                      color: t.colors.text,
                    }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={t.colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    accessibilityLabel="Password"
                  />

                  {!!error && (
                    <Text variant="caption" style={{ color: t.colors.error, paddingHorizontal: 4 }}>
                      {error}
                    </Text>
                  )}

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleEmail}
                    disabled={loading}
                    style={[styles.primaryBtn, { backgroundColor: t.colors.primary }]}
                  >
                    {loading
                      ? <ActivityIndicator color={t.colors.onPrimary} size="small" />
                      : <Text variant="body" style={{ color: t.colors.onPrimary, fontFamily: t.fonts.sansSemi }}>
                          Enter
                        </Text>}
                  </Pressable>

                  <Pressable accessibilityRole="button" onPress={() => setShowEmail(false)} style={styles.textBtn}>
                    <Text variant="caption" tone="muted">Back</Text>
                  </Pressable>
                </>
              )}
            </Animated.View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  plate: { position: 'absolute', top: 0, left: 0, right: 0 },
  plateImg: { width: '100%', height: '100%' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '58%' },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 32 },
  wordmark: { alignItems: 'center', gap: 14 },
  // Letter spacing is applied after the final character too, so centred text
  // sits left by exactly that much. The padding puts it back.
  manna: { letterSpacing: 10, paddingLeft: 10, fontSize: 40 },
  dailyWord: { letterSpacing: 4, paddingLeft: 4 },
  tagline: { textAlign: 'center', fontSize: 16, marginTop: 14, marginBottom: 28 },
  actions: { gap: 12 },
  appleBtn: { height: 52, width: '100%' },
  primaryBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    justifyContent: 'center', minHeight: MIN_TOUCH,
  },
  textBtn: { alignItems: 'center', paddingVertical: 12, minHeight: MIN_TOUCH, justifyContent: 'center' },
  input: {
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 15,
    fontSize: 16, minHeight: MIN_TOUCH,
  },
});
