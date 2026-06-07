import type { Quiz } from './quiz';
import type { Priority, TagColor } from './problem';

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
  title?: string;
  prompt: string;
  broken: string;
  hint: string;
  fixed: string;
  why: string;
}

export interface Exercise {
  id: string;
  lvl: number;
  priority: Priority;
  title: string;
  prompt: string;
  hints?: string[];
  solution?: string;
}

export interface Followup {
  prompt: string;
  answer: string;
}

/** The "data reasoning" framework the module teaches before any SQL. */
export interface ReasoningFramework {
  question?: string;
  grain?: string;
  included?: string;
  excluded?: string;
  table?: string;
  metric?: string;
  denom?: string;
  wrong?: string;
  validate?: string;
}

export interface Module {
  id: ModuleId;
  day: string;
  badge: Badge;
  bcolor?: TagColor;
  title: string;
  /** internal skill key matched against the skills checklist */
  skill: string;
  /** HTML concept explanation (trusted, authored in-repo) */
  concept: string;
  sqlPattern?: string;
  schemaRefs?: string[];
  /** plain-Python analogy (lists/dicts/loops — never pandas) */
  pysupport?: string;
  reasoning?: ReasoningFramework;
  /** one or more predict-the-output drills */
  predicts: Predict[];
  /** one or more debug-the-query drills */
  debugs: Debug[];
  exercises: Exercise[];
  quiz: Quiz;
  mistakes?: string[];
  edges?: string[];
  interview?: string;
  followup?: Followup;
  locked?: boolean;
  meta?: { why: string; outcome: string };
}
