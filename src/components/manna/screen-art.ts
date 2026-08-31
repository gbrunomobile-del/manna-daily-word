import type { ImageSourcePropType } from 'react-native';

/**
 * Engraved plates for each screen's header.
 *
 * Metro resolves requires statically, so a missing file breaks the bundle
 * rather than failing gracefully — which is why these stay commented until
 * the artwork is actually in assets/. Every screen renders correctly without
 * them; the arch simply doesn't appear.
 *
 * Expected: square PNG, no arch frame, no label, transparent or ivory ground.
 * Around 512px is plenty — the arch displays them at 96pt.
 */
export const SCREEN_ART: Partial<Record<'today' | 'journey' | 'bible' | 'way' | 'you', ImageSourcePropType>> = {
  // today:   require('../../../assets/tab-today.png'),
  // journey: require('../../../assets/tab-journey.png'),
  // bible:   require('../../../assets/tab-bible.png'),
  // way:     require('../../../assets/tab-way.png'),
  // you:     require('../../../assets/tab-you.png'),
};
