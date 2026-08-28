import type { Lesson } from '@/types';
import { BREAD_OF_LIFE } from './bread-of-life';

export const LESSONS: Readonly<Record<string, Lesson>> = {
  [BREAD_OF_LIFE.id]: BREAD_OF_LIFE,
};

export const getLesson = (id: string): Lesson | undefined => LESSONS[id];

/** The portion for today. Later this comes from the user's path. */
export const TODAYS_LESSON_ID = BREAD_OF_LIFE.id;
