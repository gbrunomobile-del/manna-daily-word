import type { ImageSourcePropType } from 'react-native';

/**
 * Engraved plates for each screen's header.
 *
 * The active/inactive naming is left over from a tab-bar mockup; these are
 * used as screen headers rather than tab icons, so only one plate per screen
 * is needed and the distinction doesn't apply here.
 *
 * Metro resolves requires statically, so every file listed must exist.
 */
export const SCREEN_ART: Partial<
  Record<'today' | 'journey' | 'bible' | 'way' | 'you', ImageSourcePropType>
> = {
  today:   require('../../../assets/manna_today_active.png'),
  journey: require('../../../assets/manna_journey_inactive.png'),
  bible:   require('../../../assets/manna_bible_inactive.png'),
  way:     require('../../../assets/manna_the_way_inactive.png'),
  you:     require('../../../assets/manna_you_inactive.png'),
};
