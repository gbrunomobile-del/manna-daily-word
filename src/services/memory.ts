import type { ScriptureRef, TranslationId } from '@/types/scripture';

/**
 * TREASURE — Scripture memory model and scheduling.
 *
 * Two decisions shape everything here.
 *
 * The seed pool carries references and curated metadata but no Scripture text.
 * Text is fetched once, at first encounter, and then persisted onto the item
 * for good — so nothing is transcribed from memory into the codebase, and a
 * verse works offline forever after it has been met once.
 *
 * A memory item pins its translation when it is introduced and never follows
 * the reader's global version setting. Learning wording in one translation and
 * being tested against another would fail people for remembering correctly.
 */

export type MemoryState =
  | 'new'
  | 'learning'
  | 'remembering'
  | 'treasured';

/** What the user is asked to do with a verse in a given step. */
export type MemoryMode =
  | 'read'        // first encounter — no test
  | 'notice'      // emphasis illuminated
  | 'missing'     // words removed
  | 'build'       // phrase blocks reordered
  | 'whisper';    // recall aloud, then self-assess

/** How the user judged their own recall. Feeds the schedule. */
export type Recall = 'remembered' | 'almost' | 'notYet';

/** Curated, never derived at runtime. */
export interface SeedVerse {
  id: string;
  ref: ScriptureRef;
  /** Broad themes, used to keep a session varied. */
  themes: string[];
  /**
   * Words to illuminate, given as words rather than indices — the exact text
   * is not known until it is fetched, so positions cannot be curated ahead.
   */
  emphasis?: string[];
  /** Curated sets of words to remove, in increasing difficulty. */
  omissions?: string[][];
}

export interface MemoryItem {
  id: string;
  ref: ScriptureRef;
  /** Fixed at introduction. Never rewritten when the reader changes version. */
  translation: TranslationId;
  /** Verbatim, fetched once. Empty until the verse is first encountered. */
  text: string;

  themes: string[];
  emphasis: string[];
  omissions: string[][];

  state: MemoryState;
  /** 0–100. Crosses the treasured threshold through repeated recall. */
  strength: number;

  introducedAt?: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  treasuredAt?: string;

  successes: number;
  failures: number;
}

/**
 * Days until the next review, by how many successful recalls have accumulated.
 *
 * Deliberately a plain table rather than SM-2 or similar. It is legible, it is
 * easy to reason about, and it is isolated here so a better algorithm can
 * replace it without touching a single screen.
 */
const INTERVALS = [0, 1, 3, 7, 14, 30, 60, 120] as const;

/** Strength at which a verse is considered treasured. */
export const TREASURED_AT = 80;

const dayMs = 86_400_000;
const iso = (d: Date) => d.toISOString();

/**
 * Apply a recall result to an item, returning the updated copy.
 *
 * Strength moves generously upward and gently downward: forgetting once should
 * not undo weeks of work, and the app should never feel like it is punishing
 * an honest “not yet”.
 */
export function applyRecall(item: MemoryItem, result: Recall, now = new Date()): MemoryItem {
  const successes = result === 'notYet' ? item.successes : item.successes + 1;
  const failures = result === 'notYet' ? item.failures + 1 : item.failures;

  const delta = result === 'remembered' ? 18 : result === 'almost' ? 7 : -12;
  const strength = Math.max(0, Math.min(100, item.strength + delta));

  // “Almost” and “not yet” both bring the verse back sooner than its run of
  // successes alone would suggest.
  const step =
    result === 'remembered' ? Math.min(successes, INTERVALS.length - 1)
    : result === 'almost' ? Math.min(Math.max(successes - 1, 0), 3)
    : 0;

  const next = new Date(now.getTime() + INTERVALS[step] * dayMs);

  const wasTreasured = item.state === 'treasured';
  const state: MemoryState =
    strength >= TREASURED_AT ? 'treasured'
    : strength >= 40 ? 'remembering'
    : 'learning';

  return {
    ...item,
    successes,
    failures,
    strength,
    state,
    lastReviewedAt: iso(now),
    nextReviewAt: iso(next),
    treasuredAt:
      state === 'treasured' && !wasTreasured ? iso(now) : item.treasuredAt,
  };
}

/** True when a verse has crossed into treasured on this attempt. */
export const justTreasured = (before: MemoryItem, after: MemoryItem): boolean =>
  before.state !== 'treasured' && after.state === 'treasured';

export const isDue = (item: MemoryItem, now = new Date()): boolean =>
  !!item.nextReviewAt && new Date(item.nextReviewAt) <= now;

/**
 * Choose the verses for a session.
 *
 * Feels unpredictable, is not: overdue work comes first, then verses in
 * progress, then something new. A treasured verse surfaces occasionally to
 * confirm it has actually stuck.
 *
 * Themes are spread where the schedule allows — ten verses about fear in a row
 * is a worse session than a slightly less optimal review order.
 */
export function selectSession(
  items: MemoryItem[],
  count: number,
  now = new Date(),
): MemoryItem[] {
  const overdue = items
    .filter((i) => i.state !== 'new' && isDue(i, now))
    .sort((a, b) => (a.nextReviewAt ?? '').localeCompare(b.nextReviewAt ?? ''));

  const learning = items.filter((i) => i.state === 'learning' && !isDue(i, now));
  const fresh = items.filter((i) => i.state === 'new');
  const treasured = items.filter((i) => i.state === 'treasured' && !isDue(i, now));

  const pick: MemoryItem[] = [];
  const taken = new Set<string>();
  const themeCount: Record<string, number> = {};

  /** Prefer a verse whose themes are not already crowding this session. */
  const add = (pool: MemoryItem[], limit: number) => {
    const ordered = [...pool].sort((a, b) => weight(a) - weight(b));
    for (const item of ordered) {
      if (pick.length >= count || limit <= 0) return;
      if (taken.has(item.id)) continue;
      pick.push(item);
      taken.add(item.id);
      item.themes.forEach((th) => { themeCount[th] = (themeCount[th] ?? 0) + 1; });
      limit--;
    }
  };

  const weight = (i: MemoryItem) =>
    i.themes.reduce((sum, th) => sum + (themeCount[th] ?? 0), 0);

  // Roughly the shape the brief describes, scaled to the session length and
  // falling through when a pool is empty.
  add(overdue, Math.ceil(count * 0.4));
  add(learning, Math.ceil(count * 0.4));
  add(fresh, Math.ceil(count * 0.3));
  add(treasured, 1);

  // Whatever is left, fill from anything remaining rather than short-changing
  // the session.
  add([...overdue, ...learning, ...fresh, ...treasured], count);

  return pick.slice(0, count);
}

/** Create a fresh memory item from a seed entry. */
export function itemFromSeed(seed: SeedVerse, translation: TranslationId): MemoryItem {
  return {
    id: seed.id,
    ref: seed.ref,
    translation,
    text: '',
    themes: seed.themes,
    emphasis: seed.emphasis ?? [],
    omissions: seed.omissions ?? [],
    state: 'new',
    strength: 0,
    successes: 0,
    failures: 0,
  };
}
