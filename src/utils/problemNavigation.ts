import type { Ladder, Problem, ProblemId, ProgressState, Mode } from '@/types';
import { problemStatus } from '@/state/selectors';

export function ladderOf(ladders: Ladder[], id: ProblemId): Ladder | undefined {
  return ladders.find((l) => l.problemIds.includes(id));
}

export function nextProblemId(ladder: Ladder, id: ProblemId): ProblemId | null {
  const i = ladder.problemIds.indexOf(id);
  return i >= 0 && i < ladder.problemIds.length - 1 ? ladder.problemIds[i + 1] : null;
}

export function prevProblemId(ladder: Ladder, id: ProblemId): ProblemId | null {
  const i = ladder.problemIds.indexOf(id);
  return i > 0 ? ladder.problemIds[i - 1] : null;
}

/** First not-completed problem in a ladder (where the "you are here" marker sits). */
export function ladderNextId(ladder: Ladder, state: ProgressState): ProblemId {
  const open = ladder.problemIds.find((pid) => problemStatus(state, pid) !== 'completed');
  return open ?? ladder.problemIds[ladder.problemIds.length - 1];
}

/** Recommended next problem across all ladders: first incomplete in ladder order. */
export function recommendedProblemId(ladders: Ladder[], state: ProgressState): ProblemId | null {
  for (const l of ladders) {
    const open = l.problemIds.find((pid) => problemStatus(state, pid) !== 'completed');
    if (open) return open;
  }
  return null;
}

export function whatTrains(p: Problem): string {
  if (p.teaches) {
    const s = p.teaches.replace(/<[^>]+>/g, '').split('. ')[0];
    return s.length > 118 ? s.slice(0, 115) + '…' : s.endsWith('.') ? s : s + '.';
  }
  return '';
}

/** First not-completed problem of a given implementation mode. */
export function nextInCategory(problems: Problem[], state: ProgressState, mode: Mode): ProblemId | null {
  const p = problems.find((x) => x.mode === mode && problemStatus(state, x.id) !== 'completed');
  return p ? p.id : null;
}
