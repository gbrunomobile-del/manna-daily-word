/**
 * THE WAY — progress through the skill tree.
 *
 * Topics unlock in sequence. XP accrues per correct answer. Nothing here is
 * punitive: a failed attempt costs no progress, it simply does not complete
 * the topic yet.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'manna.way.v1';

export interface WayState {
  /** Topic ids fully completed. */
  completed: string[];
  /** Topic ids attempted but not yet passed. */
  attempted: string[];
  /** Best score per topic, as a raw count of correct answers. */
  bestScores: Record<string, number>;
  xp: number;
  hydrated: boolean;
}

interface Actions {
  hydrate: () => Promise<void>;
  recordAttempt: (topicId: string, score: number, total: number) => Promise<void>;
  reset: () => Promise<void>;
}

const initial: WayState = {
  completed: [],
  attempted: [],
  bestScores: {},
  xp: 0,
  hydrated: false,
};

/**
 * The share of a topic that must be answered correctly to pass it.
 *
 * Proportional rather than a fixed count: topics vary in length already, and
 * will vary more as sections grow into several units. A hardcoded three meant
 * an eight-question topic could be passed with five wrong.
 */
const PASS_RATIO = 0.6;

export const passMarkFor = (total: number) => Math.max(1, Math.ceil(total * PASS_RATIO));

export const useWay = create<WayState & Actions>((set, get) => ({
  ...initial,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as WayState) : null;
      set({ ...initial, ...(saved ?? {}), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  recordAttempt: async (topicId, score, total) => {
    const s = get();
    const previousBest = s.bestScores[topicId] ?? 0;
    const improved = score > previousBest;
    const passed = score >= passMarkFor(total);

    // XP is only awarded for improvement, so replaying can't farm points.
    const gainedXp = improved ? (score - previousBest) * 10 : 0;

    const next: WayState = {
      completed: passed && !s.completed.includes(topicId)
        ? [...s.completed, topicId]
        : s.completed,
      attempted: s.attempted.includes(topicId) ? s.attempted : [...s.attempted, topicId],
      bestScores: improved ? { ...s.bestScores, [topicId]: score } : s.bestScores,
      xp: s.xp + gainedXp,
      hydrated: true,
    };

    set(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Best effort — the session still reflects the new state.
    }
  },

  reset: async () => {
    set({ ...initial, hydrated: true });
    try { await AsyncStorage.removeItem(KEY); } catch { /* best effort */ }
  },
}));

export { PASS_RATIO };
