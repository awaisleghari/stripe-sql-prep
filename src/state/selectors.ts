import type { Ladder, ProgressState, ProblemId, Problem, Mode } from '@/types';

export type ProblemStatus = 'notstarted' | 'attempted' | 'completed' | 'review';

/** Single source of truth for a problem's status. */
export function problemStatus(state: ProgressState, id: ProblemId): ProblemStatus {
  const p = state.problems[id];
  if (!p) return 'notstarted';
  if (p.completed) return 'completed';
  if (p.needsReview) return 'review';
  if (p.attempted) return 'attempted';
  return 'notstarted';
}

export interface LadderProgress {
  done: number;
  total: number;
  pct: number;
}
export function ladderProgress(state: ProgressState, ladder: Ladder): LadderProgress {
  const total = ladder.problemIds.length;
  const done = ladder.problemIds.filter((id) => problemStatus(state, id) === 'completed').length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export interface GymCounts {
  total: number;
  completed: number;
  attempted: number;
  review: number;
}
export function gymCounts(state: ProgressState, problems: Problem[]): GymCounts {
  let completed = 0;
  let attempted = 0;
  let review = 0;
  for (const p of problems) {
    const s = problemStatus(state, p.id);
    if (s === 'completed') completed += 1;
    else if (s === 'review') review += 1;
    else if (s === 'attempted') attempted += 1;
  }
  return { total: problems.length, completed, attempted, review };
}

/** A ladder's final boss is "unlocked" once >= 5 of its earlier rungs are done. */
export function bossReady(state: ProgressState, ladder: Ladder): boolean {
  const buildup = ladder.problemIds.slice(0, -1);
  const done = buildup.filter((id) => problemStatus(state, id) === 'completed').length;
  return done >= Math.min(5, buildup.length);
}

export interface CategoryCoverage {
  mode: Mode;
  total: number;
  completed: number;
  attempted: number;
  pct: number;
}

/** Coverage per implementation mode (SQL, Python, Product, …). Pure. */
export function categoryCoverage(state: ProgressState, problems: Problem[]): CategoryCoverage[] {
  const modes = [...new Set(problems.map((p) => p.mode))];
  return modes.map((mode) => {
    const list = problems.filter((p) => p.mode === mode);
    const completed = list.filter((p) => problemStatus(state, p.id) === 'completed').length;
    const attempted = list.filter((p) => {
      const st = problemStatus(state, p.id);
      return st === 'attempted' || st === 'review';
    }).length;
    return { mode, total: list.length, completed, attempted, pct: list.length ? Math.round((completed / list.length) * 100) : 0 };
  });
}
