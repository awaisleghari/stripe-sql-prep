import type { Problem, GymFilters, ProgressState } from '@/types';
import { problemStatus } from '@/state/selectors';

/** Pure predicate used by Browse All. State is needed only for the status filter. */
export function filterMatch(p: Problem, filters: GymFilters, state: ProgressState): boolean {
  const f = filters;
  if (f.ladder && p.ladder !== f.ladder) return false;
  if (f.mode && p.mode !== f.mode) return false;
  if (f.difficulty && p.difficulty !== f.difficulty) return false;
  if (f.priority && p.priority !== f.priority) return false;
  if (f.module && p.module !== f.module) return false;
  if (f.source && p.source !== f.source) return false;
  if (f.obj && !(p.obj ?? []).includes(f.obj)) return false;
  if (f.status && problemStatus(state, p.id) !== f.status) return false;
  if (f.timed === 'timed' && !p.timed) return false;
  if (f.timed === 'untimed' && p.timed) return false;
  if (f.q) {
    const hay = [p.title, p.business, p.prompt, (p.concept ?? []).join(' '), (p.obj ?? []).join(' '), p.metric ?? '', p.source, p.stage]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  return true;
}
