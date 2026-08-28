export type MemoryStrength = 'new' | 'learning' | 'strong' | 'reviewDue';

export type MemoryItem = {
  id: string;
  /** What the user is holding onto — a verse, a truth, a connection. */
  kind: 'verse' | 'truth' | 'connection' | 'person' | 'place';
  front: string;
  back: string;
  reference?: string;
  nextReview: string;
  lastReviewed?: string;
  strength: MemoryStrength;
  difficulty: number;
  successCount: number;
  failureCount: number;
};
