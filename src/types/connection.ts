import type { ScriptureRef } from './scripture';

/**
 * Connections are first-class data, not a Reveal implementation detail —
 * so the Bible reader can query them independently of any lesson.
 */
export type ConnectionType =
  | 'PROPHECY' | 'FULFILMENT' | 'PARALLEL' | 'QUOTATION'
  | 'THEME' | 'CONTEXT' | 'TYPOLOGY' | 'CONTRAST';

export type Connection = {
  id: string;
  source: ScriptureRef;
  target: ScriptureRef;
  type: ConnectionType;
  /** One line a reader sees before opening the full Reveal. */
  summary: string;
  /** MANNA commentary explaining the relationship carefully. */
  explanation: readonly string[];
  /** 1–5. Drives ordering, never certainty of doctrine. */
  strength: 1 | 2 | 3 | 4 | 5;
  courseIds?: readonly string[];
};

export const CONNECTION_LABEL: Record<ConnectionType, string> = {
  PROPHECY: 'Prophecy',
  FULFILMENT: 'Fulfilment',
  PARALLEL: 'Parallel',
  QUOTATION: 'Quotation',
  THEME: 'Theme',
  CONTEXT: 'Context',
  TYPOLOGY: 'Pattern',
  CONTRAST: 'Contrast',
};
