import type { Module, ModuleProgress, ProgressState } from '@/types';

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
