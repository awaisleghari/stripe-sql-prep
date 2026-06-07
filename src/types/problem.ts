import type { ModuleId } from './module';
import type { LadderId } from './ladder';

export type ProblemId = string;

/** Allowed tag/chip colors. Anything outside this union renders unstyled — see data-integrity test. */
export type TagColor = 'blue' | 'geekblue' | 'gold' | 'green' | 'grey' | 'red' | 'volcano';

export type Difficulty = 'recognition' | 'easy' | 'medium' | 'hard' | 'final-boss';
export type Priority = 'required' | 'should' | 'stretch' | 'boss';

/** Implementation mode — drives the "what you produce" framing and the Gym filter. */
export type Mode =
  | 'SQL' | 'Python' | 'Pseudocode' | 'DataLogic'
  | 'Product' | 'Experiment' | 'Causal' | 'Statistics'
  | 'Object' | 'Mixed';

export interface Complexity {
  time: string;
  memory: string;
  note?: string;
}

/** Structured "check your work" block (SQL/Python problems). */
export interface VerifyBlock {
  grain: string;
  columns: string[];
  sample?: { cols: string[]; rows: string[][] };
  commonWrong: string[];
  validation: string[];
  edgeCases: string[];
  checklist: string[];
}

/**
 * A single practice problem. The guided-UX fields (task/deliverable/why/before/howto/
 * hints/confusion/explain/teaches) are what make a problem feel coached rather than dumped.
 * Exactly one "context in play" path is used: schema (SQL) | inputSpec (Python) | context (reasoning).
 * Exactly one "answer" path is used: solution (SQL/code) | model (reasoning prose).
 */
export interface Problem {
  id: ProblemId;
  title: string;
  ladder: LadderId;
  pos: number;
  stage: string;
  lvl: number;
  difficulty: Difficulty;
  priority: Priority;
  mode: Mode;
  source: string;
  module: ModuleId | null;
  timed: boolean;
  est: string;

  // framing
  business: string;
  task?: string;
  prompt: string;
  why?: string;
  prereq?: string;
  harder?: string;
  teaches?: string;
  deliverable?: string;
  before?: string[];
  howto?: string[];
  hints: string[];
  confusion?: string;
  explain: string;
  next?: ProblemId | null;

  // context in play (one of)
  schema?: string[];
  inputSpec?: string;
  context?: string;

  // answer (one of)
  solution?: string;
  model?: string;

  // mode extras
  broken?: string;
  signature?: string;
  tests?: string;
  complexity?: Complexity;
  rubric?: string[];
  verify?: VerifyBlock;
  grain?: string;

  // tagging / search
  concept?: string[];
  obj?: string[];
  metric?: string;
  edge?: string[];
}
