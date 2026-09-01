/**
 * TRANSLATIONS
 *
 * Only genuinely public-domain texts. ESV, NIV, NLT and NASB are all under
 * licence and cannot be served without an agreement with their publishers,
 * so they are deliberately absent rather than listed and broken.
 *
 * Served by bolls.life, which returns verses as structured objects rather
 * than a wall of text — that is what makes verse numbering possible.
 */

export interface Version {
  /** bolls.life translation code. */
  id: string;
  /** Shown in the picker. */
  short: string;
  name: string;
  /** One line of context, so the choice is meaningful rather than alphabet soup. */
  note: string;
}

export const VERSIONS: Version[] = [
  {
    id: 'WEB',
    short: 'WEB',
    name: 'World English Bible',
    note: 'Modern English, public domain',
  },
  {
    id: 'KJV',
    short: 'KJV',
    name: 'King James Version',
    note: '1611, the traditional English text',
  },
  {
    id: 'ASV',
    short: 'ASV',
    name: 'American Standard Version',
    note: '1901, closely literal',
  },
  {
    id: 'YLT',
    short: 'YLT',
    name: "Young's Literal Translation",
    note: 'Word for word, awkward but exact',
  },
  {
    id: 'DBY',
    short: 'DBY',
    name: 'Darby Translation',
    note: '1890, careful with tenses',
  },
];

export const DEFAULT_VERSION = 'WEB';

export const getVersion = (id: string): Version =>
  VERSIONS.find((v) => v.id === id) ?? VERSIONS[0];
