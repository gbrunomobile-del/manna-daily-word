import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/theme';

interface Props {
  /** Rendered width in points. Height scales with it. */
  width?: number;
  /** Defaults to the gold accent. */
  color?: string;
  /** Softens the whole ornament. */
  opacity?: number;
}

/**
 * ENGRAVED ORNAMENT
 *
 * A typographic rule in the manner of a 19th-century engraved title page:
 * tapered rules running out from a central lozenge, with flanking points.
 * Drawn as vectors so it stays crisp at any size and takes the theme's
 * colours — the gold means the same thing here as everywhere else.
 */
export const Ornament = ({ width = 208, color, opacity = 1 }: Props) => {
  const t = useTheme();
  const stroke = color ?? t.colors.accent;
  const height = (width / 220) * 16;

  return (
    <View style={[styles.wrap, { width, height, opacity }]}>
      <Svg width={width} height={height} viewBox="0 0 220 16">
        {/* Left tapered rule — thin at the outer end, thickening inward */}
        <Path d="M 20 8 L 94 6.4 L 94 9.6 Z" fill={stroke} />
        {/* Right tapered rule, mirrored */}
        <Path d="M 200 8 L 126 6.4 L 126 9.6 Z" fill={stroke} />

        {/* Central lozenge */}
        <Path d="M 110 1.4 L 116.5 8 L 110 14.6 L 103.5 8 Z" fill={stroke} />

        {/* Inner flanking points */}
        <Path d="M 98 8 L 100.6 5.4 L 100.6 10.6 Z" fill={stroke} />
        <Path d="M 122 8 L 119.4 5.4 L 119.4 10.6 Z" fill={stroke} />

        {/* Outer terminals */}
        <Circle cx="13" cy="8" r="1.7" fill={stroke} />
        <Circle cx="207" cy="8" r="1.7" fill={stroke} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
