import { create } from 'zustand';
import { localRepository, StorageKeys } from '@/services/storage';

export type ProgressState = {
  daysGathered: number;
  /** ISO dates of gathered days — never used to punish. */
  gatheredDates: string[];
  lastGathered?: string;
  /** ISO date this person began the plan. Set once, on first launch. */
  startDate?: string;
  completedLessonIds: string[];
  savedPassageIds: string[];
  totalSeconds: number;
  hydrated: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  gather: (lessonId: string, seconds: number) => Promise<void>;
  toggleSaved: (passageId: string) => Promise<void>;
  reset: () => Promise<void>;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const initial: ProgressState = {
  daysGathered: 0,
  gatheredDates: [],
  completedLessonIds: [],
  savedPassageIds: [],
  totalSeconds: 0,
  hydrated: false,
};

export const useProgress = create<ProgressState & Actions>((set, get) => ({
  ...initial,

  hydrate: async () => {
    const saved = await localRepository.get<ProgressState>(StorageKeys.progress);
    const state = { ...(saved ?? initial), hydrated: true };

    // The plan begins the day someone first opens the app, not on 1 January.
    // Stamped once and never moved, so the count is stable across devices
    // and across a reinstall that restores this store.
    if (!state.startDate) {
      state.startDate = todayIso();
      await localRepository.set(StorageKeys.progress, state);
    }

    set(state);
  },

  gather: async (lessonId, seconds) => {
    const s = get();
    const today = todayIso();
    const already = s.gatheredDates.includes(today);
    const next: ProgressState = {
      ...s,
      daysGathered: already ? s.daysGathered : s.daysGathered + 1,
      gatheredDates: already ? s.gatheredDates : [...s.gatheredDates, today],
      lastGathered: today,
      completedLessonIds: s.completedLessonIds.includes(lessonId)
        ? s.completedLessonIds
        : [...s.completedLessonIds, lessonId],
      totalSeconds: s.totalSeconds + seconds,
      hydrated: true,
    };
    set(next);
    await localRepository.set(StorageKeys.progress, next);
  },

  toggleSaved: async (passageId) => {
    const s = get();
    const has = s.savedPassageIds.includes(passageId);
    const next = {
      ...s,
      savedPassageIds: has
        ? s.savedPassageIds.filter((p) => p !== passageId)
        : [...s.savedPassageIds, passageId],
    };
    set(next);
    await localRepository.set(StorageKeys.progress, next);
  },

  reset: async () => {
    set({ ...initial, hydrated: true });
    await localRepository.remove(StorageKeys.progress);
  },
}));

/** Last seven days, most recent last. Missing days are simply not filled. */
export const weekDots = (gatheredDates: readonly string[]): boolean[] => {
  const out: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(gatheredDates.includes(d.toISOString().slice(0, 10)));
  }
  return out;
};

/**
 * Which day of the 365-day plan someone is on.
 *
 * Counted from the day they started, not the calendar year — so everyone
 * begins at Genesis on day one, whenever they join. Capped at 365; a plan
 * that has run its course simply stays at the end rather than wrapping.
 */
export const planDay = (startDate?: string): number => {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date(`${isoDaysAgo(0)}T00:00:00`);
  const elapsed = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return Math.min(Math.max(elapsed + 1, 1), 365);
};

const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

/**
 * Consecutive days gathered, counting back from today.
 *
 * Today not being gathered yet does not break the streak — it is still early.
 * The streak only ends once a whole day has passed untouched.
 */
export const currentStreak = (gatheredDates: readonly string[]): number => {
  const set = new Set(gatheredDates);
  let start = 0;
  if (!set.has(isoDaysAgo(0))) {
    if (!set.has(isoDaysAgo(1))) return 0;
    start = 1;
  }
  let n = 0;
  for (let i = start; i < 3650; i++) {
    if (!set.has(isoDaysAgo(i))) break;
    n++;
  }
  return n;
};

/** True once today has been gathered. */
export const gatheredToday = (gatheredDates: readonly string[]): boolean =>
  gatheredDates.includes(isoDaysAgo(0));

/**
 * Someone coming back after a gap of two days or more.
 *
 * This exists so the app can say "Welcome back" rather than announce a loss.
 * Nothing is taken away for being absent; the number simply starts again.
 */
export const isReturning = (gatheredDates: readonly string[]): boolean => {
  if (gatheredDates.length === 0) return false;
  const set = new Set(gatheredDates);
  return !set.has(isoDaysAgo(0)) && !set.has(isoDaysAgo(1));
};
