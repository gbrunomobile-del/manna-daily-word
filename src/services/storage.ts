import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Repository abstraction. UI never touches AsyncStorage directly, so a
 * backend can replace this without changing a single component.
 */
export interface Repository {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export const localRepository: Repository = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* progress is best-effort */ }
  },
  async remove(key: string): Promise<void> {
    try { await AsyncStorage.removeItem(key); } catch { /* noop */ }
  },
};

export const StorageKeys = {
  progress: 'manna.progress.v1',
  onboarding: 'manna.onboarding.v1',
  memory: 'manna.memory.v1',
  settings: 'manna.settings.v1',
} as const;
