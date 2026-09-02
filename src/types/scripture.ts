/**
 * Scripture is stored as structured data, never as a loose string.
 * `text` is verbatim from the named translation and must never be edited.
 */
/**
 * Translations the app actually serves — all public domain.
 *
 * ESV and NIV are deliberately absent: both are licensed, and listing them in
 * the type invites code that assumes access we do not have. They can be added
 * when there is an agreement behind them.
 */
export type TranslationId = 'WEB' | 'KJV' | 'ASV' | 'YLT' | 'GNV' | 'DRB' | 'ESV';

export type Translation = {
  id: TranslationId;
  name: string;
  abbreviation: string;
  /** Public-domain translations can be bundled; licensed ones must be fetched. */
  bundled: boolean;
  copyright: string;
};

export type ScriptureRef = {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
};

export type ScripturePassage = {
  id: string;
  ref: ScriptureRef;
  translation: TranslationId;
  /** Verbatim translation text. Never paraphrase or abridge silently. */
  text: string;
  /** Word indices to illuminate. Emphasis only — never alters the text. */
  illuminate?: readonly string[];
};

/**
 * MANNA's own words about Scripture. Structurally separate from
 * ScripturePassage so commentary can never be rendered as Scripture.
 */
export type Commentary = {
  id: string;
  body: readonly string[];
  /** Set when Christians legitimately read the passage differently. */
  contested?: string;
};

export const formatRef = (ref: ScriptureRef): string => {
  const base = `${ref.book} ${ref.chapter}:${ref.verseStart}`;
  return ref.verseEnd && ref.verseEnd !== ref.verseStart ? `${base}-${ref.verseEnd}` : base;
};
