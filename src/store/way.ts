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
  /** Topic ids fully completed (3 or more correct out of 5). */
  completed: string[];
  /** Topic ids attempted but not yet passed. */
  attempted: string[];
  /** Best score per topic, out of 5. */
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

const PASS_MARK = 3;

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
    const passed = score >= PASS_MARK;

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

export { PASS_MARK };
