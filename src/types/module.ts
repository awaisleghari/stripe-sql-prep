import type { Quiz } from './quiz';

export type ModuleId = string;
export type Badge = 'beginner' | 'intermediate' | 'advanced';

export interface Predict {
  prompt: string;
  query?: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Debug {
  prompt: string;
  broken: string;
  hint: string;
  fixed: string;
  why: string;
}

export interface Exercise {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  hints?: string[];
  solution?: string;
  explain?: string;
}

export interface Module {
  id: ModuleId;
  day: string;
  badge: Badge;
  title: string;
  /** internal skill key matched against the skills checklist */
  skill: string;
  /** HTML concept explanation (trusted, authored in-repo) */
  concept: string;
  /** minimal SQL pattern shown on the Concept tab */
  sqlPattern?: string;
  schemaRefs?: string[];
  predict?: Predict;
  debug?: Debug;
  exercises: Exercise[];
  quiz: Quiz;
  mistakes?: string[];
  edges?: string[];
  interview?: string;
  locked?: boolean;
  meta?: { why: string; outcome: string };
}
