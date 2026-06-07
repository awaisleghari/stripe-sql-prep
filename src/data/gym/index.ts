import type { Problem, ProblemId } from '@/types';
import { conditionalProblems } from './sql/conditional';
import { joinsProblems } from './sql/joins';
import { windowProblems } from './sql/window';
import { revenueProblems } from './sql/revenue';
import { refundsProblems } from './sql/refunds';
import { logicProblems } from './logic';
import { pythonProblems } from './python';
import { productProblems } from './product';
import { experimentProblems } from './experiment';

export { LADDERS } from './ladders';

/** All gym problems, in ladder order. Add a category file's array to this list. */
export const PROBLEMS: Problem[] = [...conditionalProblems, ...joinsProblems, ...windowProblems, ...revenueProblems, ...refundsProblems, ...logicProblems, ...pythonProblems, ...productProblems, ...experimentProblems];

const BY_ID = new Map<ProblemId, Problem>(PROBLEMS.map((p) => [p.id, p]));
export function getProblem(id: ProblemId | null | undefined): Problem | undefined {
  return id ? BY_ID.get(id) : undefined;
}
