import type { Module, ModuleProgress, ProgressState, Mock, Rubric, Problem } from '@/types';

export interface QuizScore {
  correct: number;
  total: number;
  answered: number;
  /** all five answered */
  all: boolean;
}

/** Pure: score a module's quiz from stored answers. */
export function quizScore(module: Module, progress: ModuleProgress | undefined): QuizScore {
  const answers = progress?.quiz ?? {};
  let correct = 0;
  let answered = 0;
  module.quiz.forEach((qq, i) => {
    if (i in answers) {
      answered += 1;
      if (answers[i] === qq.answer) correct += 1;
    }
  });
  return { correct, total: module.quiz.length, answered, all: answered === module.quiz.length };
}

/** A module is interview-ready when its quiz is >= 4/5 and it is marked complete. */
export function moduleReady(module: Module, progress: ModuleProgress | undefined): boolean {
  const s = quizScore(module, progress);
  return !!progress?.complete && s.all && s.correct >= 4;
}

/** Readiness score 0–100 across the (unlocked) modules. Pure. */
export function readiness(state: ProgressState, modules: Module[]): number {
  const live = modules.filter((m) => !m.locked);
  if (!live.length) return 0;
  const ready = live.filter((m) => moduleReady(m, state.modules[m.id])).length;
  return Math.round((ready / live.length) * 100);
}

export interface MockReadiness {
  got: number;
  max: number;
  pct: number;
}

/** Sum of mock self-scores over the sum of rubric maxima. Pure. */
export function mockReadiness(state: ProgressState, mock: Mock, rubricsById: Record<string, Rubric>): MockReadiness {
  let got = 0;
  let max = 0;
  mock.components.forEach((c, i) => {
    const rb = rubricsById[c.rubric];
    if (!rb) return;
    max += rb.max;
    const scores = state.mock[`${mock.id}_${i}`];
    if (scores) got += Object.values(scores).reduce((a, b) => a + b, 0);
  });
  return { got, max, pct: max ? Math.round((got / max) * 100) : 0 };
}

export interface BlendedReadiness {
  overall: number;
  /** modules that are interview-ready */
  foundation: number;
  /** gym problems completed */
  practice: number;
  /** mock self-score */
  simulation: number;
}

/**
 * One blended readiness score across the three pillars, weighted
 * foundation 35% / practice 45% / simulation 20%. Pure.
 */
export function blendedReadiness(
  state: ProgressState,
  modules: Module[],
  problems: Problem[],
  mock: Mock,
  rubricsById: Record<string, Rubric>,
): BlendedReadiness {
  const foundation = readiness(state, modules);
  const completed = problems.filter((p) => state.problems[p.id]?.completed).length;
  const practice = problems.length ? Math.round((completed / problems.length) * 100) : 0;
  const simulation = mockReadiness(state, mock, rubricsById).pct;
  const overall = Math.round(foundation * 0.35 + practice * 0.45 + simulation * 0.2);
  return { overall, foundation, practice, simulation };
}
