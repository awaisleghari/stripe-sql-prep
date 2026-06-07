import type { ProgressState, Module, Problem } from '@/types';
import { categoryCoverage } from '@/state/selectors';
import { moduleReady } from '@/utils/scoring';

export interface NudgeAction {
  label: string;
  /** 'mode' → focus next problem of that mode; 'route' → navigate; 'problem' → focus a specific problem */
  type: 'mode' | 'route' | 'problem';
  value: string;
}
export interface Nudge {
  kind: 'warn' | 'tip';
  text: string;
  action?: NudgeAction;
}

/**
 * Generates prioritised "what to work on next" nudges from the blended picture.
 * Pure — the component maps each action to a store call.
 */
export function weakAreas(state: ProgressState, modules: Module[], problems: Problem[], mockGot: number): Nudge[] {
  const cov = categoryCoverage(state, problems);
  const by = (m: string) => cov.find((c) => c.mode === m);
  const sql = by('SQL');
  const py = by('Python');
  const causal = by('Causal');
  const exp = by('Experiment');
  const prod = by('Product');

  const completedTotal = problems.filter((p) => state.problems[p.id]?.completed).length;
  const nonSqlCompleted = problems.filter((p) => p.mode !== 'SQL' && state.problems[p.id]?.completed).length;
  const out: Nudge[] = [];

  if (completedTotal >= 3 && nonSqlCompleted === 0) {
    out.push({
      kind: 'warn',
      text: "So far you've only practiced SQL. Stripe interviews blend SQL with Python, product, and experiment reasoning.",
      action: { label: 'Browse non-SQL drills', type: 'route', value: 'gym' },
    });
  }
  if (sql && sql.completed >= 4 && py && py.completed === 0) {
    out.push({
      kind: 'warn',
      text: "You're building SQL strength, but haven't written any Python implementation yet.",
      action: { label: 'Start Python', type: 'mode', value: 'Python' },
    });
  }
  if (causal && causal.completed === 0 && completedTotal >= 5) {
    out.push({
      kind: 'warn',
      text: "You haven't pressure-tested causal reasoning — a recurring Stripe DS theme.",
      action: { label: 'Try a causal problem', type: 'mode', value: 'Causal' },
    });
  }
  if (exp && exp.completed === 0 && completedTotal >= 5) {
    out.push({
      kind: 'tip',
      text: 'Experiment design hasn\u2019t been practiced yet — interviews often include an A/B question.',
      action: { label: 'Try experimentation', type: 'mode', value: 'Experiment' },
    });
  }
  if (prod && prod.completed >= 1 && !state.problems['pa6']?.completed) {
    out.push({
      kind: 'tip',
      text: 'Finish the Product Analytics final boss before your next mock.',
      action: { label: 'Open the boss (pa6)', type: 'problem', value: 'pa6' },
    });
  }
  const ready = modules.filter((m) => !m.locked && moduleReady(m, state.modules[m.id])).length;
  if (completedTotal > 0 && ready === 0) {
    out.push({
      kind: 'warn',
      text: 'No learning module is interview-ready yet — lock in the fundamentals (quiz \u22654/5 + mark complete).',
      action: { label: 'Go to modules', type: 'route', value: 'learn' },
    });
  }
  if (mockGot === 0 && completedTotal >= 10) {
    out.push({
      kind: 'tip',
      text: "You've built solid reps — run Mock 1 end-to-end to pressure-test under time.",
      action: { label: 'Open Mock 1', type: 'route', value: 'mock' },
    });
  }
  return out.slice(0, 4);
}
