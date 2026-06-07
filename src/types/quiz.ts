export type QuizLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface QuizQuestion {
  /** L0 → L5 difficulty ladder. Each module has exactly five, one per level. */
  level: QuizLevel;
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  why: string;
  concept?: string;
}

/** Enforced to be length 5 by the data-integrity test. */
export type Quiz = QuizQuestion[];
