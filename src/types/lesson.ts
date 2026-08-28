import type { Commentary, ScripturePassage } from './scripture';

export type StepType =
  | 'SCRIPTURE' | 'CONTEXT' | 'MULTIPLE_CHOICE' | 'WHO_SAID_IT'
  | 'REVEAL' | 'FILL_BLANK' | 'REFLECTION'
  | 'VERSE_ORDER' | 'EVENT_ORDER' | 'TRUE_FALSE'
  | 'TRUE_ALMOST_TRUE' | 'CONNECT' | 'CONTEXT_CHOICE' | 'MEMORY_RECALL';

export type Choice = {
  id: string;
  text: string;
  correct?: boolean;
  /** Shown after selection. Never shaming on an incorrect choice. */
  response?: string;
};

type Base = { id: string; type: StepType };

export type ScriptureStep = Base & {
  type: 'SCRIPTURE';
  passageId: string;
  eyebrow?: string;
};

export type ContextStep = Base & {
  type: 'CONTEXT';
  title: string;
  commentary: Commentary;
};

export type ChoiceStep = Base & {
  type: 'MULTIPLE_CHOICE' | 'WHO_SAID_IT' | 'TRUE_FALSE' | 'CONTEXT_CHOICE';
  prompt: string;
  /** Quoted text sitting above the question, e.g. the saying to attribute. */
  quote?: string;
  quoteRefLabel?: string;
  choices: readonly Choice[];
  /** Shown once answered correctly. */
  affirmation: string;
  explanation: string;
};

export type RevealStep = Base & {
  type: 'REVEAL';
  connectionId: string;
  prompt: string;
  quote?: string;
  choices: readonly Choice[];
};

export type FillBlankStep = Base & {
  type: 'FILL_BLANK';
  prompt: string;
  /** Use ___ to mark the gap. */
  template: string;
  options: readonly string[];
  answer: string;
  affirmation: string;
};

export type ReflectionStep = Base & {
  type: 'REFLECTION';
  statement: readonly string[];
  question: string;
};

export type LessonStep =
  | ScriptureStep | ContextStep | ChoiceStep
  | RevealStep | FillBlankStep | ReflectionStep;

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'foundation' | 'growing' | 'deep';
  passages: Readonly<Record<string, ScripturePassage>>;
  steps: readonly LessonStep[];
  /** Closing line on the Gathered screen. */
  closingPassageId: string;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  lessonIds: readonly string[];
};

export type JourneyNodeKind = 'lesson' | 'story' | 'reveal' | 'memory' | 'milestone';
export type JourneyNodeState = 'completed' | 'current' | 'available' | 'locked';

export type JourneyNode = {
  id: string;
  label: string;
  kind: JourneyNodeKind;
  lessonId?: string;
};
