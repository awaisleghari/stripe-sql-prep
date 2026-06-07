import type { ModuleId } from './module';
import type { LadderId, } from './ladder';
import type { ProblemId, Difficulty, Priority, Mode } from './problem';

export type Route = 'dashboard' | 'learn' | 'gym' | 'schema' | 'resources' | 'mock' | 'panic' | 'reason';
export type GymTab = 'path' | 'focus' | 'browse' | 'review';

export interface GymFilters {
  q?: string;
  mode?: Mode;
  ladder?: LadderId;
  difficulty?: Difficulty;
  priority?: Priority;
  module?: ModuleId;
  source?: string;
  obj?: string;
  status?: 'notstarted' | 'attempted' | 'completed' | 'review';
  timed?: 'timed' | 'untimed';
}

export interface GymState {
  tab: GymTab;
  ladder: LadderId;
  focus: ProblemId | null;
  last: ProblemId | null;
  filters: GymFilters;
}

export interface ModuleProgress {
  complete?: boolean;
  /** quiz question index -> chosen option index */
  quiz?: Record<number, number>;
  confidence?: number;
  /** misc per-module attempt flags (predict/debug reveals, exercise checks) */
  att?: Record<string, boolean>;
}

export interface ProblemProgress {
  attempted?: boolean;
  completed?: boolean;
  needsReview?: boolean;
}

export interface ProgressState {
  startedAt: number;
  route: Route;
  /** which module the Learn route is showing */
  activeModuleId: ModuleId | null;
  modules: Record<ModuleId, ModuleProgress>;
  problems: Record<ProblemId, ProblemProgress>;
  gym: GymState;
  /** mock self-scores: componentKey -> (criterionIndex -> 0|1|2) */
  mock: Record<string, Record<number, number>>;
}
