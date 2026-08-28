import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useTheme } from '@/theme';

type Props = {
  size?: number;
  /** Stroke colour for the mark. Defaults to primary text. */
  color?: string;
  /** The gold point above the figure. */
  sparkColor?: string;
  strokeWidth?: number;
};

/**
 * THE MANNA MARK.
 * Descending provision (the point), a figure with raised hands receiving it,
 * and an open vessel formed by the M. Interim trace of the brand mark —
 * replace with the supplied vector when available.
 */
export const MannaMark = ({ size = 44, color, sparkColor, strokeWidth = 2 }: Props) => {
  const t = useTheme();
  const stroke = color ?? t.colors.textPrimary;
  const spark = sparkColor ?? t.colors.accent;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* descending provision */}
      <Circle cx={24} cy={5.6} r={2.4} fill={spark} />
      <G stroke={spark} strokeWidth={strokeWidth * 0.75} strokeLinecap="round" opacity={0.85}>
        <Path d="M24 11.4v2.2" />
        <Path d="M18.8 9.1l1.5 1.6" />
        <Path d="M29.2 9.1l-1.5 1.6" />
      </G>
      {/* the one receiving */}
      <G stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M24 16.4v12.2" />
        <Path d="M24 19.2 18.4 14" />
        <Path d="M24 19.2 29.6 14" />
        {/* the vessel — an M that is also open hands */}
        <Path d="M8.5 40V22.6L24 34.2l15.5-11.6V40" />
      </G>
    </Svg>
  );
};
