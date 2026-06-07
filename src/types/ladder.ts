import type { ModuleId } from './module';
import type { ProblemId } from './problem';

/** SQL ladders are the core; "skill" ladders train reasoning/coding around them. */
export type LadderCategory = 'sql' | 'skill';

export type LadderId = string;

export interface Ladder {
  id: LadderId;
  title: string;
  category: LadderCategory;
  /** The SQL module this ladder drills, if any. Skill ladders have null. */
  module: ModuleId | null;
  /** Internal concept key (used for grouping/search). */
  concept: string;
  blurb: string;
  /** Ordered problem ids forming the progression (recognition → … → final boss). */
  problemIds: ProblemId[];
}
