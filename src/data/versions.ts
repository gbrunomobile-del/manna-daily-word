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

export type Provider = 'bolls' | 'esv';

export interface Version {
  /** Translation code, as its provider knows it. */
  id: string;
  /** Shown in the picker. */
  short: string;
  name: string;
  /** One line of context, so the choice is meaningful rather than alphabet soup. */
  note: string;
  /** Where the text comes from. */
  provider: Provider;
  /**
   * Attribution the licence requires on screen. Public-domain texts need none;
   * licensed ones do, and omitting it breaches the agreement.
   */
  copyright?: string;
  /**
   * Environment variable holding the API key. A version whose key is absent is
   * hidden from the picker rather than offered and then failing.
   */
  keyEnv?: string;
}

/**
 * Everything public domain comes from bolls.life: no key, no quota, no limit
 * on how much anyone reads. Licensed translations each bring their own
 * provider, their own key and their own conditions.
 */
const ALL: Version[] = [
  {
    id: 'WEB',
    short: 'WEB',
    name: 'World English Bible',
    note: 'Modern English, public domain',
    provider: 'bolls',
  },
  {
    id: 'KJV',
    short: 'KJV',
    name: 'King James Version',
    note: '1611, the traditional English text',
    provider: 'bolls',
  },
  {
    id: 'ASV',
    short: 'ASV',
    name: 'American Standard Version',
    note: '1901, closely literal',
    provider: 'bolls',
  },
  {
    id: 'YLT',
    short: 'YLT',
    name: "Young's Literal Translation",
    note: 'Word for word, awkward but exact',
    provider: 'bolls',
  },
  {
    id: 'GNV',
    short: 'GNV',
    name: 'Geneva Bible',
    note: '1599, the Bible of the Reformation',
    provider: 'bolls',
  },
  {
    id: 'DRB',
    short: 'DRB',
    name: 'Douay\u2013Rheims',
    note: 'From the Latin Vulgate',
    provider: 'bolls',
  },
  {
    id: 'ESV',
    short: 'ESV',
    name: 'English Standard Version',
    note: 'Modern, widely used · licensed',
    provider: 'esv',
    copyright: 'Scripture quotations are from the ESV\u00ae Bible, copyright \u00a9 2001 by Crossway. Used by permission. All rights reserved.',
    keyEnv: 'EXPO_PUBLIC_ESV_KEY',
  },
];

/** Whether a version's key is present in this build. */
const available = (v: Version) =>
  !v.keyEnv || !!process.env[v.keyEnv as keyof typeof process.env];

/**
 * The versions this build can actually serve.
 *
 * A translation without its key is left out entirely — offering ESV and then
 * failing on the first chapter would be worse than not offering it.
 */
export const VERSIONS: Version[] = ALL.filter(available);

/** WEB stays the default: unlimited, unlicensed, and what Treasure pins to. */
export const DEFAULT_VERSION = 'WEB';

export const getVersion = (id: string): Version =>
  VERSIONS.find((v) => v.id === id) ?? VERSIONS[0];
