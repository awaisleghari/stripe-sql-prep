import type { Problem, ProblemId } from '@/types';
import { conditionalProblems } from './sql/conditional';

export { LADDERS } from './ladders';

/** Every problem in the gym. Add a category file's array here. */
export const PROBLEMS: Problem[] = [...conditionalProblems];

const BY_ID = new Map<ProblemId, Problem>(PROBLEMS.map((p) => [p.id, p]));
export function getProblem(id: ProblemId | null | undefined): Problem | undefined {
  return id ? BY_ID.get(id) : undefined;
}
