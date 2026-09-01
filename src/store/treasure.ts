import { create } from 'zustand';
import { localRepository, StorageKeys } from '@/services/storage';
import { TREASURE_SEED } from '@/data/treasure-seed';
import {
  applyRecall, itemFromSeed, isDue, type MemoryItem, type Recall,
} from '@/services/memory';
import type { TranslationId } from '@/types/scripture';

/** Public-domain by default. A memory item keeps whichever it was learned in. */
const SEED_TRANSLATION: TranslationId = 'WEB';

export type SessionLength = 5 | 10 | 20;

interface Persisted {
  /** Bumped when the shape changes, so old storage can be migrated safely. */
  version: number;
  items: MemoryItem[];
  sessionLength: SessionLength;
  sessionsCompleted: number;
}

interface State extends Persisted {
  hydrated: boolean;
}

interface Actions {
  hydrate: () => Promise<void>;
  /** Store the text fetched for a verse, once, at first encounter. */
  setText: (id: string, text: string) => Promise<void>;
  /** Record a self-assessed recall and reschedule. Returns the updated item. */
  record: (id: string, result: Recall) => Promise<MemoryItem | null>;
  setSessionLength: (n: SessionLength) => Promise<void>;
  completeSession: () => Promise<void>;
}

const CURRENT_VERSION = 1;

const initial: Persisted = {
  version: CURRENT_VERSION,
  items: [],
  sessionLength: 10,
  sessionsCompleted: 0,
};

/**
 * Bring stored state up to the current shape.
 *
 * Also folds in any seed verses added since the user last opened the app, so
 * growing the pool never requires a reinstall and never disturbs progress on
 * verses already being learned.
 */
function migrate(saved: Partial<Persisted> | null): Persisted {
  const base: Persisted = { ...initial, ...(saved ?? {}) };

  const known = new Set(base.items.map((i) => i.id));
  const added = TREASURE_SEED
    .filter((s) => !known.has(s.id))
    .map((s) => itemFromSeed(s, SEED_TRANSLATION));

  return { ...base, version: CURRENT_VERSION, items: [...base.items, ...added] };
}

export const useTreasure = create<State & Actions>((set, get) => ({
  ...initial,
  hydrated: false,

  hydrate: async () => {
    const saved = await localRepository.get<Partial<Persisted>>(StorageKeys.memory);
    const next = migrate(saved);
    set({ ...next, hydrated: true });
    await localRepository.set(StorageKeys.memory, next);
  },

  setText: async (id, text) => {
    const s = get();
    const items = s.items.map((i) =>
      i.id === id
        ? { ...i, text, introducedAt: i.introducedAt ?? new Date().toISOString() }
        : i,
    );
    set({ items });
    await localRepository.set(StorageKeys.memory, persist({ ...s, items }));
  },

  record: async (id, result) => {
    const s = get();
    const before = s.items.find((i) => i.id === id);
    if (!before) return null;

    const after = applyRecall(before, result);
    const items = s.items.map((i) => (i.id === id ? after : i));
    set({ items });
    await localRepository.set(StorageKeys.memory, persist({ ...s, items }));
    return after;
  },

  setSessionLength: async (sessionLength) => {
    const s = get();
    set({ sessionLength });
    await localRepository.set(StorageKeys.memory, persist({ ...s, sessionLength }));
  },

  completeSession: async () => {
    const s = get();
    const sessionsCompleted = s.sessionsCompleted + 1;
    set({ sessionsCompleted });
    await localRepository.set(StorageKeys.memory, persist({ ...s, sessionsCompleted }));
  },
}));

/** Strip the runtime-only flag before writing. */
const persist = (s: State | (Persisted & Partial<State>)): Persisted => ({
  version: CURRENT_VERSION,
  items: s.items,
  sessionLength: s.sessionLength,
  sessionsCompleted: s.sessionsCompleted,
});

// ── Selectors ───────────────────────────────────────────────────────

export const treasuredCount = (items: MemoryItem[]) =>
  items.filter((i) => i.state === 'treasured').length;

export const learningCount = (items: MemoryItem[]) =>
  items.filter((i) => i.state === 'learning' || i.state === 'remembering').length;

/** Verses whose review has come due — the number shown as “ready to remember”. */
export const readyCount = (items: MemoryItem[], now = new Date()) =>
  items.filter((i) => i.state !== 'new' && isDue(i, now)).length;
