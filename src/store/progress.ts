import { create } from 'zustand';
import { localRepository, StorageKeys } from '@/services/storage';

export type ProgressState = {
  daysGathered: number;
  /** ISO dates of gathered days — never used to punish. */
  gatheredDates: string[];
  lastGathered?: string;
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
    set({ ...(saved ?? initial), hydrated: true });
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
