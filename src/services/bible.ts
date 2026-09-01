/**
 * SCRIPTURE FETCHING
 *
 * bolls.life returns a chapter as an array of verse objects, which is what
 * lets the reader lay out real verse numbers and paragraphs. The previous
 * source returned one undifferentiated blob of text.
 *
 * Responses are cached in memory for the session, so paging back and forth
 * between chapters does not re-fetch.
 */

import { BOOKS } from '@/data/books';
import { QUESTIONS } from '@/data/way-questions';

export interface Verse {
  number: number;
  text: string;
}

/** bolls.life numbers books 1-66 in canonical order, matching our BOOKS array. */
export function bookId(name: string): number | undefined {
  const i = BOOKS.findIndex((b) => b.name.toLowerCase() === name.trim().toLowerCase());
  return i === -1 ? undefined : i + 1;
}

const cache = new Map<string, Verse[]>();

/** Strip the HTML tags bolls.life includes for italics and Jesus' words. */
const clean = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export async function fetchChapter(
  book: string,
  chapter: number,
  version: string,
): Promise<Verse[]> {
  const key = `${version}:${book}:${chapter}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const id = bookId(book);
  if (!id) throw new Error(`Unknown book: ${book}`);

  const res = await fetch(`https://bolls.life/get-chapter/${version}/${id}/${chapter}/`);
  if (!res.ok) throw new Error('Could not load that chapter.');

  const raw: { verse: number; text: string }[] = await res.json();
  const verses = raw
    .map((v) => ({ number: v.verse, text: clean(v.text) }))
    .filter((v) => v.text.length > 0);

  cache.set(key, verses);
  return verses;
}

/** A verse found by search, with enough context to open it. */
export interface VerseHit {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Search the text of a translation.
 *
 * This is a word match rather than a semantic one — searching “fear not” finds
 * verses containing those words, not verses about courage. That covers the
 * common case of half-remembering a phrase and wanting to find where it sits.
 */
export async function searchVerses(
  query: string,
  version = 'WEB',
  limit = 40,
): Promise<VerseHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url =
    `https://bolls.life/v2/find/${version}` +
    `?search=${encodeURIComponent(q)}&match_case=false&match_whole=false&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed.');

  const body = await res.json();
  // The endpoint has returned both a bare array and a wrapped object; accept either.
  const rows: { book: number; chapter: number; verse: number; text: string }[] =
    Array.isArray(body) ? body : (body?.results ?? []);

  return rows
    .map((r) => ({
      book: BOOKS[r.book - 1]?.name ?? '',
      chapter: r.chapter,
      verse: r.verse,
      text: clean(r.text),
    }))
    .filter((h) => h.book && h.text);
}

/**
 * Verses encountered in The Way, as "genesis-1-31" keys.
 *
 * This is what lets the reader mark the exact lines someone has met in a
 * lesson — the thing no other Bible app does, because no other Bible app
 * knows what you have been taught.
 */
function buildWayIndex(): Set<string> {
  const out = new Set<string>();

  const add = (ref?: string) => {
    if (!ref) return;
    // "Genesis 1:31" or "Genesis 3:12" — ranges and multi-verse refs are skipped
    // deliberately; marking a whole span would overstate what was actually seen.
    const m = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!m) return;
    const [, book, ch, v] = m;
    out.add(`${book.trim().toLowerCase().replace(/\s+/g, '-')}-${ch}-${v}`);
  };

  for (const set of Object.values(QUESTIONS)) {
    for (const q of set) {
      if ('verse' in q) add(q.verse);
      if (q.kind === 'match') q.pairs.forEach((p) => add(p.reference));
    }
  }
  return out;
}

let wayIndex: Set<string> | null = null;

/** True when this exact verse has been taught in The Way. */
export function metInTheWay(book: string, chapter: number, verse: number): boolean {
  if (!wayIndex) wayIndex = buildWayIndex();
  return wayIndex.has(
    `${book.trim().toLowerCase().replace(/\s+/g, '-')}-${chapter}-${verse}`,
  );
}
