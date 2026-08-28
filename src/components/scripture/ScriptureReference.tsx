import React from 'react';
import { Text } from '../primitives/Text';
import type { ScriptureRef } from '@/types';
import { formatRef } from '@/types';

type Props = { refValue: ScriptureRef; tone?: 'muted' | 'accent' | 'secondary' | 'inverse' };

export const ScriptureReference = ({ refValue, tone = 'muted' }: Props) => (
  <Text variant="reference" tone={tone} uppercase accessibilityLabel={formatRef(refValue)}>
    {formatRef(refValue)}
  </Text>
);
