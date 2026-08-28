import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INK='#18201C', IVORY='#F8F4EA', GOLD='#D7AD5A', GREEN='#356653', MUTED='#8A9089', SURFACE='#F1EADC', BORDER='#E4DCC9';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await AsyncStorage.setItem('manna_user', JSON.stringify({ email, name: name.trim() }));
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
          <View style={s.titleBlock}>
            <TextInput style={[s.title, { color: INK }]} editable={false} value="Begin your journey." pointerEvents="none" />
            <TextInput style={[s.subtitle, { color: MUTED }]} editable={false} value="Gather truth. Daily." pointerEvents="none" />
          </View>
          <View style={s.card}>
            {[['YOUR NAME','name',name,setName,'words',false,'e.g. John Smith'],
              ['EMAIL','email',email,setEmail,'email-address',false,'you@example.com'],
              ['PASSWORD','pass',password,setPassword,'default',true,'Min. 6 characters']
            ].map(([lbl,_k,val,setter,kb,sec,ph]:any) => (
              <View key={lbl} style={s.field}>
                <View style={s.labelRow}>
                  <View style={[s.labelDot,{backgroundColor:GREEN}]} />
                  <TextInput style={[s.label,{color:MUTED}]} editable={false} value={lbl} pointerEvents="none" />
                </View>
                <TextInput
                  style={[s.input,{backgroundColor:SURFACE,borderColor:BORDER,color:INK}]}
                  value={val} onChangeText={setter}
                  placeholder={ph} placeholderTextColor={MUTED}
                  keyboardType={kb} autoCapitalize={lbl==='YOUR NAME'?'words':'none'}
                  secureTextEntry={sec}
                />
              </View>
            ))}
            {!!error && <View style={[s.errorBox,{backgroundColor:'#F3E2DF',borderColor:'#A85A5544'}]}>
              <TextInput style={{color:'#A85A55',fontSize:13}} editable={false} value={`⚠  ${error}`} pointerEvents="none" />
            </View>}
            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8} style={[s.btn,{backgroundColor:INK}]}>
              {loading
                ? <ActivityIndicator color={IVORY} size="small" />
                : <TextInput style={{color:GOLD,fontSize:14,letterSpacing:1.4,fontWeight:'600'}} editable={false} value="Create Account" pointerEvents="none" />
              }
            </TouchableOpacity>
          </View>
          <View style={s.switchRow}>
            <TextInput style={{color:MUTED,fontSize:14}} editable={false} value="Already have an account? " pointerEvents="none" />
            <TouchableOpacity onPress={() => router.back()}>
              <TextInput style={{color:GREEN,fontSize:14,fontWeight:'600'}} editable={false} value="Sign in" pointerEvents="none" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow:1, padding:24, paddingBottom:48, justifyContent:'center' },
  titleBlock: { marginBottom:32, gap:6 },
  title: { fontSize:29, lineHeight:35, fontWeight:'400', letterSpacing:-0.2 },
  subtitle: { fontSize:15, lineHeight:22 },
  card: { gap:16, marginBottom:24 },
  field: { gap:8 },
  labelRow: { flexDirection:'row', alignItems:'center', gap:6 },
  labelDot: { width:5, height:5, borderRadius:2.5 },
  label: { fontSize:11, letterSpacing:1.2, fontWeight:'600' },
  input: { borderWidth:1, borderRadius:12, paddingHorizontal:16, paddingVertical:13, fontSize:16 },
  errorBox: { borderRadius:10, borderWidth:1, padding:12 },
  btn: { borderRadius:12, paddingVertical:15, alignItems:'center', marginTop:4 },
  switchRow: { flexDirection:'row', justifyContent:'center', alignItems:'center' },
});
