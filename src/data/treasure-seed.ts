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
];

/** Every theme in the pool, for the Treasury's filters. */
export const TREASURE_THEMES = Array.from(
  new Set(TREASURE_SEED.flatMap((v) => v.themes)),
).sort();
