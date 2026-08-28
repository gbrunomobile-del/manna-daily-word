import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Manna palette
const INK = '#18201C';
const IVORY = '#F8F4EA';
const GOLD = '#D7AD5A';
const MORNING = '#F2DDAF';
const GREEN = '#356653';
const MUTED = '#8A9089';
const SURFACE = '#F1EADC';
const BORDER = '#E4DCC9';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await AsyncStorage.setItem('manna_user', JSON.stringify({ email, name: email.split('@')[0] }));
      router.replace('/(tabs)/today');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: IVORY }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <View style={[s.mark, { backgroundColor: GREEN }]}>
              <View style={[s.markInner, { backgroundColor: GOLD }]} />
            </View>
            <View style={s.wordmark}>
              <View style={s.wordmarkTop} />
              <View style={[s.wordmarkLine, { backgroundColor: INK }]} />
            </View>
          </View>
          <View style={s.eyebrow}><View style={[s.eyebrowLine, { backgroundColor: GOLD }]} /></View>
          <View style={s.titleBlock}>
            <TextInput
              style={[s.title, { color: INK }]}
              editable={false}
              value="Welcome back."
              pointerEvents="none"
            />
          </View>
          <View style={s.card}>
            <View style={s.field}>
              <View style={s.labelRow}>
                <View style={[s.labelDot, { backgroundColor: GREEN }]} />
                <TextInput style={[s.label, { color: MUTED }]} editable={false} value="EMAIL" pointerEvents="none" />
              </View>
              <TextInput
                style={[s.input, { backgroundColor: SURFACE, borderColor: BORDER, color: INK }]}
                value={email} onChangeText={setEmail}
                placeholder="you@example.com" placeholderTextColor={MUTED}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              />
            </View>
            <View style={s.field}>
              <View style={s.labelRow}>
                <View style={[s.labelDot, { backgroundColor: GREEN }]} />
                <TextInput style={[s.label, { color: MUTED }]} editable={false} value="PASSWORD" pointerEvents="none" />
              </View>
              <TextInput
                style={[s.input, { backgroundColor: SURFACE, borderColor: BORDER, color: INK }]}
                value={password} onChangeText={setPassword}
                placeholder="••••••••" placeholderTextColor={MUTED}
                secureTextEntry autoCapitalize="none"
              />
            </View>
            {!!error && <View style={[s.errorBox, { backgroundColor: '#F3E2DF', borderColor: '#A85A5544' }]}><TextInput style={{ color: '#A85A55', fontSize: 13 }} editable={false} value={`⚠  ${error}`} pointerEvents="none" /></View>}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8} style={[s.btn, { backgroundColor: INK }]}>
              {loading
                ? <ActivityIndicator color={IVORY} size="small" />
                : <TextInput style={{ color: GOLD, fontSize: 14, letterSpacing: 1.4, fontWeight: '600' }} editable={false} value="Enter" pointerEvents="none" />
              }
            </TouchableOpacity>
          </View>
          <View style={s.switchRow}>
            <TextInput style={{ color: MUTED, fontSize: 14 }} editable={false} value="New here? " pointerEvents="none" />
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <TextInput style={{ color: GREEN, fontSize: 14, fontWeight: '600' }} editable={false} value="Create account" pointerEvents="none" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingBottom: 48, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32, gap: 12 },
  mark: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  markInner: { width: 20, height: 20, borderRadius: 10 },
  wordmark: { gap: 4 },
  wordmarkTop: { height: 8, width: 120, backgroundColor: '#35665322', borderRadius: 4 },
  wordmarkLine: { height: 2, width: 120, borderRadius: 2 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  eyebrowLine: { height: 2, width: 32, borderRadius: 2 },
  titleBlock: { marginBottom: 28 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: '400', letterSpacing: -0.2 },
  card: { gap: 16, marginBottom: 24 },
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelDot: { width: 5, height: 5, borderRadius: 2.5 },
  label: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16 },
  errorBox: { borderRadius: 10, borderWidth: 1, padding: 12 },
  btn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
