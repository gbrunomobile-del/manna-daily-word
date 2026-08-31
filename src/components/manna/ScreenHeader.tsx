import React from 'react';
import { View, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';

interface Props {
  /** The engraved plate. Omitted until the artwork exists; the header still works. */
  art?: ImageSourcePropType;
  /** Small uppercase line above the title. */
  eyebrow?: string;
  /** The screen's heading. */
  title: string;
  /** Optional line under the title. */
  subtitle?: string;
  align?: 'center' | 'left';
}

const ARCH_W = 96;
const ARCH_H = 118;

/**
 * SCREEN HEADER
 *
 * An illuminated opening for a screen: an engraved plate in an arch, above the
 * heading. The arch is drawn in code rather than baked into the image, so it
 * takes the theme's border and surface colours and adapts to dark mode — and
 * so the same plate can be reframed later without regenerating artwork.
 */
export const ScreenHeader = ({ art, eyebrow, title, subtitle, align = 'center' }: Props) => {
  const t = useTheme();
  const centred = align === 'center';

  return (
    <View style={[styles.wrap, centred && styles.centred]}>
      {art && (
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[
            styles.arch,
            {
              backgroundColor: t.colors.surface,
              borderColor: t.colors.border,
            },
          ]}
        >
          <Image source={art} style={styles.art} resizeMode="contain" />
          {/* A hairline of gold along the arch's inner edge — the same signal
              used everywhere else, kept faint so it frames rather than shouts. */}
          <View
            pointerEvents="none"
            style={[styles.archInner, { borderColor: t.colors.accent + '33' }]}
          />
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(80).duration(460)} style={centred && styles.centred}>
        {eyebrow && (
          <Text
            variant="caption"
            tone="muted"
            uppercase
            style={[styles.eyebrow, centred && { textAlign: 'center' }]}
          >
            {eyebrow}
          </Text>
        )}
        <Text
          variant="hero"
          style={[{ color: t.colors.text }, centred && { textAlign: 'center' }]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="body"
            tone="muted"
            style={[styles.subtitle, centred && { textAlign: 'center' }]}
          >
            {subtitle}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  centred: { alignItems: 'center' },
  arch: {
    width: ARCH_W,
    height: ARCH_H,
    borderWidth: 1,
    // An arch: fully rounded at the crown, barely rounded at the foot.
    borderTopLeftRadius: ARCH_W / 2,
    borderTopRightRadius: ARCH_W / 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  archInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 5,
    borderWidth: 1,
    borderTopLeftRadius: ARCH_W / 2 - 5,
    borderTopRightRadius: ARCH_W / 2 - 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  art: { width: '78%', height: '78%' },
  eyebrow: { marginBottom: 6, letterSpacing: 1.2 },
  subtitle: { marginTop: 6 },
});
