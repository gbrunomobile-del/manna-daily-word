import type { SeedVerse } from '@/services/memory';

/**
 * TREASURE — the starting pool.
 *
 * References and curated metadata only. The Scripture text is deliberately
 * absent: it is fetched once at first encounter and then kept on the item, so
 * no wording is transcribed into the codebase and nothing can drift from the
 * translation it claims to be.
 *
 * Emphasis and omissions are given as words rather than positions, since the
 * exact text is not known until it is fetched. They are matched at runtime.
 *
 * Chosen for spread as much as for familiarity — Law, Prophets, Psalms,
 * Gospels and Epistles are all represented, so an early session cannot be five
 * consecutive Psalms.
 */
export const TREASURE_SEED: SeedVerse[] = [
  {
    id: 'john-3-16',
    ref: { book: 'John', chapter: 3, verseStart: 16 },
    themes: ['grace', 'jesus', 'promises'],
    emphasis: ['loved', 'gave', 'believes', 'eternal'],
    omissions: [['loved'], ['loved', 'gave'], ['loved', 'gave', 'believes', 'eternal']],
  },
  {
    id: 'psalm-23-1',
    ref: { book: 'Psalms', chapter: 23, verseStart: 1 },
    themes: ['trust', 'provision'],
    emphasis: ['shepherd', 'lack'],
    omissions: [['shepherd'], ['shepherd', 'lack']],
  },
  {
    id: 'philippians-4-6-7',
    ref: { book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 },
    themes: ['fear', 'prayer', 'peace'],
    emphasis: ['anxious', 'prayer', 'thanksgiving', 'peace', 'guard'],
    omissions: [['anxious'], ['anxious', 'prayer'], ['anxious', 'prayer', 'peace', 'guard']],
  },
  {
    id: 'proverbs-3-5-6',
    ref: { book: 'Proverbs', chapter: 3, verseStart: 5, verseEnd: 6 },
    themes: ['wisdom', 'trust'],
    emphasis: ['Trust', 'heart', 'understanding', 'straight'],
    omissions: [['Trust'], ['Trust', 'understanding'], ['Trust', 'heart', 'understanding', 'straight']],
  },
  {
    id: 'isaiah-41-10',
    ref: { book: 'Isaiah', chapter: 41, verseStart: 10 },
    themes: ['fear', 'promises'],
    emphasis: ['afraid', 'dismayed', 'strengthen', 'help', 'uphold'],
    omissions: [['afraid'], ['afraid', 'strengthen'], ['afraid', 'dismayed', 'strengthen', 'uphold']],
  },
  {
    id: 'romans-8-28',
    ref: { book: 'Romans', chapter: 8, verseStart: 28 },
    themes: ['hope', 'providence'],
    emphasis: ['all', 'good', 'love', 'purpose'],
    omissions: [['good'], ['all', 'good'], ['all', 'good', 'love', 'purpose']],
  },
  {
    id: 'joshua-1-9',
    ref: { book: 'Joshua', chapter: 1, verseStart: 9 },
    themes: ['fear', 'courage'],
    emphasis: ['strong', 'courageous', 'afraid', 'wherever'],
    omissions: [['strong'], ['strong', 'courageous'], ['strong', 'courageous', 'afraid']],
  },
  {
    id: 'psalm-119-105',
    ref: { book: 'Psalms', chapter: 119, verseStart: 105 },
    themes: ['scripture', 'guidance'],
    emphasis: ['lamp', 'light', 'path'],
    omissions: [['lamp'], ['lamp', 'light'], ['lamp', 'light', 'path']],
  },
  {
    id: 'matthew-6-33',
    ref: { book: 'Matthew', chapter: 6, verseStart: 33 },
    themes: ['kingdom', 'priorities'],
    emphasis: ['first', 'Kingdom', 'righteousness', 'added'],
    omissions: [['first'], ['first', 'Kingdom'], ['first', 'Kingdom', 'righteousness', 'added']],
  },
  {
    id: 'ephesians-2-8-9',
    ref: { book: 'Ephesians', chapter: 2, verseStart: 8, verseEnd: 9 },
    themes: ['grace', 'faith'],
    emphasis: ['grace', 'faith', 'gift', 'boast'],
    omissions: [['grace'], ['grace', 'gift'], ['grace', 'faith', 'gift', 'boast']],
  },
  {
    id: 'lamentations-3-22-23',
    ref: { book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 },
    themes: ['mercy', 'hope'],
    emphasis: ['loving', 'kindnesses', 'new', 'morning', 'faithfulness'],
    omissions: [['new'], ['new', 'morning'], ['new', 'morning', 'faithfulness']],
  },
  {
    id: 'galatians-5-22-23',
    ref: { book: 'Galatians', chapter: 5, verseStart: 22, verseEnd: 23 },
    themes: ['holy spirit', 'character'],
    emphasis: ['love', 'joy', 'peace', 'patience', 'self-control'],
    omissions: [['love'], ['love', 'joy', 'peace'], ['love', 'joy', 'peace', 'patience']],
  },
  {
    id: 'micah-6-8',
    ref: { book: 'Micah', chapter: 6, verseStart: 8 },
    themes: ['justice', 'wisdom'],
    emphasis: ['justly', 'kindness', 'humbly'],
    omissions: [['justly'], ['justly', 'kindness'], ['justly', 'kindness', 'humbly']],
  },
  {
    id: '2-corinthians-12-9',
    ref: { book: '2 Corinthians', chapter: 12, verseStart: 9 },
    themes: ['grace', 'weakness'],
    emphasis: ['grace', 'sufficient', 'weakness', 'perfect'],
    omissions: [['sufficient'], ['grace', 'sufficient'], ['grace', 'sufficient', 'weakness']],
  },
  {
    id: 'hebrews-11-1',
    ref: { book: 'Hebrews', chapter: 11, verseStart: 1 },
    themes: ['faith', 'hope'],
    emphasis: ['assurance', 'hoped', 'evidence', 'not seen'],
    omissions: [['assurance'], ['assurance', 'evidence'], ['assurance', 'hoped', 'evidence']],
  },

  // ── Promises ────────────────────────────────────────
  {
    id: 'jeremiah-29-11',
    ref: { book: 'Jeremiah', chapter: 29, verseStart: 11 },
    themes: ['hope', 'promises'],
    emphasis: ['plans', 'peace', 'hope'],
    omissions: [['plans'], ['plans', 'hope'], ['plans', 'peace', 'hope']],
  },
  {
    id: 'deuteronomy-31-6',
    ref: { book: 'Deuteronomy', chapter: 31, verseStart: 6 },
    themes: ['fear', 'courage', 'promises'],
    emphasis: ['strong', 'courageous', 'fail', 'forsake'],
    omissions: [['strong'], ['strong', 'courageous'], ['strong', 'courageous', 'forsake']],
  },
  {
    id: 'isaiah-40-31',
    ref: { book: 'Isaiah', chapter: 40, verseStart: 31 },
    themes: ['hope', 'strength'],
    emphasis: ['wait', 'renew', 'wings', 'weary'],
    omissions: [['wait'], ['wait', 'renew'], ['wait', 'renew', 'weary']],
  },
  {
    id: 'psalm-46-1',
    ref: { book: 'Psalms', chapter: 46, verseStart: 1 },
    themes: ['fear', 'refuge'],
    emphasis: ['refuge', 'strength', 'trouble'],
    omissions: [['refuge'], ['refuge', 'strength'], ['refuge', 'strength', 'trouble']],
  },
  {
    id: 'psalm-121-1-2',
    ref: { book: 'Psalms', chapter: 121, verseStart: 1, verseEnd: 2 },
    themes: ['trust', 'provision'],
    emphasis: ['hills', 'help', 'made'],
    omissions: [['help'], ['hills', 'help'], ['hills', 'help', 'made']],
  },

  // ── Character ──────────────────────────────────────
  {
    id: 'james-1-19',
    ref: { book: 'James', chapter: 1, verseStart: 19 },
    themes: ['wisdom', 'character'],
    emphasis: ['swift', 'hear', 'slow', 'speak', 'anger'],
    omissions: [['swift'], ['swift', 'slow'], ['swift', 'hear', 'slow', 'anger']],
  },
  {
    id: 'colossians-3-23',
    ref: { book: 'Colossians', chapter: 3, verseStart: 23 },
    themes: ['work', 'character'],
    emphasis: ['heartily', 'Lord', 'men'],
    omissions: [['heartily'], ['heartily', 'Lord'], ['heartily', 'Lord', 'men']],
  },
  {
    id: 'ephesians-4-32',
    ref: { book: 'Ephesians', chapter: 4, verseStart: 32 },
    themes: ['forgiveness', 'character'],
    emphasis: ['kind', 'tenderhearted', 'forgiving'],
    omissions: [['kind'], ['kind', 'forgiving'], ['kind', 'tenderhearted', 'forgiving']],
  },
  {
    id: 'proverbs-15-1',
    ref: { book: 'Proverbs', chapter: 15, verseStart: 1 },
    themes: ['wisdom', 'character'],
    emphasis: ['gentle', 'wrath', 'harsh', 'anger'],
    omissions: [['gentle'], ['gentle', 'harsh'], ['gentle', 'wrath', 'harsh', 'anger']],
  },
  {
    id: 'philippians-2-3',
    ref: { book: 'Philippians', chapter: 2, verseStart: 3 },
    themes: ['humility', 'character'],
    emphasis: ['rivalry', 'humility', 'better'],
    omissions: [['humility'], ['rivalry', 'humility'], ['rivalry', 'humility', 'better']],
  },

  // ── Jesus ──────────────────────────────────────────
  {
    id: 'john-14-6',
    ref: { book: 'John', chapter: 14, verseStart: 6 },
    themes: ['jesus', 'truth'],
    emphasis: ['way', 'truth', 'life', 'Father'],
    omissions: [['way'], ['way', 'truth', 'life'], ['way', 'truth', 'life', 'Father']],
  },
  {
    id: 'matthew-11-28',
    ref: { book: 'Matthew', chapter: 11, verseStart: 28 },
    themes: ['jesus', 'rest'],
    emphasis: ['labour', 'burdened', 'rest'],
    omissions: [['rest'], ['burdened', 'rest'], ['labour', 'burdened', 'rest']],
  },
  {
    id: 'john-15-5',
    ref: { book: 'John', chapter: 15, verseStart: 5 },
    themes: ['jesus', 'abiding'],
    emphasis: ['vine', 'branches', 'remains', 'nothing'],
    omissions: [['vine'], ['vine', 'branches'], ['vine', 'branches', 'nothing']],
  },
  {
    id: 'john-1-14',
    ref: { book: 'John', chapter: 1, verseStart: 14 },
    themes: ['jesus', 'incarnation'],
    emphasis: ['Word', 'flesh', 'lived', 'glory'],
    omissions: [['flesh'], ['Word', 'flesh'], ['Word', 'flesh', 'glory']],
  },
  {
    id: 'romans-5-8',
    ref: { book: 'Romans', chapter: 5, verseStart: 8 },
    themes: ['grace', 'jesus'],
    emphasis: ['own', 'love', 'sinners', 'died'],
    omissions: [['sinners'], ['love', 'sinners'], ['love', 'sinners', 'died']],
  },

  // ── Prayer and the Word ────────────────────────────────
  {
    id: '1-thessalonians-5-16-18',
    ref: { book: '1 Thessalonians', chapter: 5, verseStart: 16, verseEnd: 18 },
    themes: ['prayer', 'joy'],
    emphasis: ['Rejoice', 'ceasing', 'thanks'],
    omissions: [['Rejoice'], ['Rejoice', 'thanks'], ['Rejoice', 'ceasing', 'thanks']],
  },
  {
    id: 'hebrews-4-12',
    ref: { book: 'Hebrews', chapter: 4, verseStart: 12 },
    themes: ['scripture', 'truth'],
    emphasis: ['living', 'active', 'sharper', 'discerning'],
    omissions: [['living'], ['living', 'active'], ['living', 'active', 'sharper']],
  },
  {
    id: '2-timothy-3-16',
    ref: { book: '2 Timothy', chapter: 3, verseStart: 16 },
    themes: ['scripture'],
    emphasis: ['breathed', 'profitable', 'teaching', 'righteousness'],
    omissions: [['breathed'], ['breathed', 'profitable'], ['breathed', 'profitable', 'righteousness']],
  },
  {
    id: 'james-1-5',
    ref: { book: 'James', chapter: 1, verseStart: 5 },
    themes: ['wisdom', 'prayer'],
    emphasis: ['lacks', 'wisdom', 'generously', 'reproach'],
    omissions: [['wisdom'], ['lacks', 'wisdom'], ['lacks', 'wisdom', 'generously']],
  },
  {
    id: 'psalm-1-1-2',
    ref: { book: 'Psalms', chapter: 1, verseStart: 1, verseEnd: 2 },
    themes: ['scripture', 'wisdom'],
    emphasis: ['Blessed', 'delight', 'meditates'],
    omissions: [['delight'], ['Blessed', 'delight'], ['Blessed', 'delight', 'meditates']],
  },

  // ── Identity ───────────────────────────────────────
  {
    id: '2-corinthians-5-17',
    ref: { book: '2 Corinthians', chapter: 5, verseStart: 17 },
    themes: ['identity', 'grace'],
    emphasis: ['new', 'creation', 'old', 'passed'],
    omissions: [['new'], ['new', 'creation'], ['new', 'creation', 'passed']],
  },
  {
    id: 'genesis-1-27',
    ref: { book: 'Genesis', chapter: 1, verseStart: 27 },
    themes: ['identity', 'creation'],
    emphasis: ['image', 'created', 'male', 'female'],
    omissions: [['image'], ['image', 'created'], ['image', 'created', 'male', 'female']],
  },
  {
    id: 'psalm-139-14',
    ref: { book: 'Psalms', chapter: 139, verseStart: 14 },
    themes: ['identity'],
    emphasis: ['fearfully', 'wonderfully', 'works'],
    omissions: [['fearfully'], ['fearfully', 'wonderfully'], ['fearfully', 'wonderfully', 'works']],
  },
  {
    id: 'romans-12-2',
    ref: { book: 'Romans', chapter: 12, verseStart: 2 },
    themes: ['identity', 'wisdom'],
    emphasis: ['conformed', 'transformed', 'renewing', 'mind'],
    omissions: [['transformed'], ['conformed', 'transformed'], ['conformed', 'transformed', 'renewing']],
  },
  {
    id: '1-peter-5-7',
    ref: { book: '1 Peter', chapter: 5, verseStart: 7 },
    themes: ['fear', 'trust'],
    emphasis: ['casting', 'worries', 'cares'],
    omissions: [['casting'], ['casting', 'cares'], ['casting', 'worries', 'cares']],
  },
];

/** Every theme in the pool, for the Treasury's filters. */
export const TREASURE_THEMES = Array.from(
  new Set(TREASURE_SEED.flatMap((v) => v.themes)),
).sort();
