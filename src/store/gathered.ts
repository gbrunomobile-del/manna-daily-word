/**
 * GATHERED — universal verse tracking.
 *
 * Every passage read anywhere in Manna (Today lesson, Bible in a Year,
 * Free Play, The Way) records its chapters here. Anything gathered is
 * rendered with a warm tint wherever it appears again, so over a year
 * the Bible visibly fills with light.
 *
 * Keys are normalised chapter ids: "genesis-1", "john-6", "psalm-23".
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'manna.gathered.v1';

/** "Genesis 1" -> "genesis-1"; "1 Corinthians 13" -> "1-corinthians-13" */
export function chapterId(reference: string): string {
  return reference
    .trim()
    .toLowerCase()
    .replace(/[:\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Expand "Genesis 1-3" into ["genesis-1","genesis-2","genesis-3"]. */
export function expandReference(reference: string): string[] {
  const ref = reference.trim();
  if (!ref) return [];

  // Cross-book range: "Genesis 50 - Exodus 2" — record both endpoints only.
  if (ref.includes(' - ')) {
    return ref.split(' - ').map(chapterId);
  }

  // Same-book range: "Genesis 1-3"
  const rangeMatch = ref.match(/^(.+?)\s+(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, book, startStr, endStr] = rangeMatch;
    const start = Number(startStr);
    const end = Number(endStr);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      const out: string[] = [];
      for (let c = start; c <= end; c++) out.push(chapterId(`${book} ${c}`));
      return out;
    }
  }

  return [chapterId(ref)];
}

interface GatheredState {
  chapters: Record<string, number>; // chapterId -> first-gathered timestamp
  hydrated: boolean;
  hydrate: () => Promise<void>;
  gather: (references: string | string[]) => Promise<void>;
  hasGathered: (reference: string) => boolean;
  count: () => number;
  reset: () => Promise<void>;
}

export const useGathered = create<GatheredState>((set, get) => ({
  chapters: {},
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const chapters = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      set({ chapters, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  gather: async (references) => {
    const list = Array.isArray(references) ? references : [references];
    const ids = list.flatMap(expandReference);
    if (ids.length === 0) return;

    const now = Date.now();
    const next = { ...get().chapters };
    let changed = false;
    for (const id of ids) {
      if (next[id] === undefined) { next[id] = now; changed = true; }
    }
    if (!changed) return;

    set({ chapters: next });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage is best-effort; the in-memory state still reflects the session.
    }
  },

  hasGathered: (reference) => {
    const ids = expandReference(reference);
    const { chapters } = get();
    return ids.length > 0 && ids.every((id) => chapters[id] !== undefined);
  },

  count: () => Object.keys(get().chapters).length,

  reset: async () => {
    set({ chapters: {} });
    try { await AsyncStorage.removeItem(KEY); } catch { /* best effort */ }
  },
}));

/** Total chapters in the Protestant canon — used for the progress ring. */
export const TOTAL_CHAPTERS = 1189;
