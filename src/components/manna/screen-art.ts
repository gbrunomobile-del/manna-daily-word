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

/**
 * The engraving for each topic in The Way.
 *
 * Kept here rather than in a screen so the tree, the Today card and the lesson
 * environment all draw from one place — there were two copies of this before
 * and a third was about to appear.
 */
export const TOPIC_ART: Record<string, ImageSourcePropType> = {
  creation: require('../../../assets/creation.png'),
  'the-fall': require('../../../assets/the-fall.png'),
  noah: require('../../../assets/noah.png'),
  abraham: require('../../../assets/abraham.png'),
  joseph: require('../../../assets/joseph.png'),
  moses: require('../../../assets/moses.png'),
  'the-law': require('../../../assets/the-law.png'),
  david: require('../../../assets/david.png'),
  isaiah: require('../../../assets/isaiah.png'),
  birth: require('../../../assets/birth.png'),
  ministry: require('../../../assets/ministry.png'),
  miracles: require('../../../assets/miracles.png'),
  cross: require('../../../assets/cross.png'),
  acts: require('../../../assets/acts.png'),
  letters: require('../../../assets/letters.png'),
  revelation: require('../../../assets/revelation.png'),
};

/**
 * The Doré lamp, separated into a still vessel and its flame so the flame can
 * be animated over it. Both share one crop, so they align when stacked.
 */
export const LAMP_ART = {
  lamp: require('../../../assets/manna_lamp.png'),
  flame: require('../../../assets/manna_flame.png'),
};
