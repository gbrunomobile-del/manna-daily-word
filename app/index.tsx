import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { Text } from '@/components/primitives/Text';

const INK = '#111612';
const GOLD = '#D7AD5A';

export default function Splash() {
  const router = useRouter();
  const rise = useSharedValue(0);

  useEffect(() => {
    rise.value = withTiming(1, { duration: 1200 });
    const check = async () => {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const user = await AsyncStorage.getItem('manna_user');
        if (user) {
          router.replace('/(tabs)/today');
        } else {
          router.replace('/(auth)/login');
        }
      } catch {
        router.replace('/(auth)/login');
      }
    };
    check();
  }, [rise, router]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: (1 - rise.value) * 12 }],
  }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: rise.value }));
  const dawnStyle = useAnimatedStyle(() => ({ opacity: rise.value * 0.9 }));

  return (
    <View style={{ flex: 1, backgroundColor: INK }}>
      <Animated.View style={[{ ...Svg.absoluteFill, position:'absolute', top:0,left:0,right:0,bottom:0 }, dawnStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="dawn" cx="50%" cy="86%" r="62%">
              <Stop offset="0%" stopColor={GOLD} stopOpacity={0.32} />
              <Stop offset="60%" stopColor={GOLD} stopOpacity={0.05} />
              <Stop offset="100%" stopColor={GOLD} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#dawn)" />
          <Circle cx="50%" cy="86%" r="16" fill={GOLD} opacity={0.85} />
          <Path d="M0 78 Q 22 70, 40 76 T 78 74 T 100 80 L100 100 L0 100 Z" fill="#0B0F0C" opacity={0.9} transform="scale(4.2)" />
        </Svg>
      </Animated.View>
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:22 }}>
        <Animated.View style={markStyle}>
          <View style={{ width:56, height:56, borderRadius:16, backgroundColor:'#D7AD5A22', alignItems:'center', justifyContent:'center' }}>
            <View style={{ width:24, height:24, borderRadius:12, backgroundColor:GOLD }} />
          </View>
        </Animated.View>
        <Animated.View style={[{ alignItems:'center' }, wordStyle]}>
          <Text variant="hero" style={{ color: GOLD, letterSpacing: 7 }} uppercase>Manna</Text>
          <Text variant="reference" style={{ color: 'rgba(238,233,221,0.66)', marginTop: 8 }} uppercase>Daily Word</Text>
        </Animated.View>
      </View>
      <Animated.View style={[{ alignItems:'center', paddingBottom:64 }, wordStyle]}>
        <Text variant="body" style={{ color: 'rgba(238,233,221,0.5)' }}>Gather truth. Daily.</Text>
      </Animated.View>
    </View>
  );
}
