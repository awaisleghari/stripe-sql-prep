import { describe, it, expect, beforeEach } from 'vitest';
import { __resetForTests, getState, setProblemStatus, answerQuiz, setModuleComplete } from '@/state/progressStore';
import { LADDERS, PROBLEMS } from '@/data/gym';
import { MODULES } from '@/data/modules';
import { ladderProgress, gymCounts, problemStatus, bossReady } from '@/state/selectors';
import { quizScore, readiness } from '@/utils/scoring';
import { nextProblemId, prevProblemId, recommendedProblemId } from '@/utils/problemNavigation';

beforeEach(() => __resetForTests());
const cond = LADDERS.find((l) => l.id === 'cond')!;

describe('selectors & navigation', () => {
  it('problemStatus defaults to notstarted', () => {
    expect(problemStatus(getState(), 'ca1')).toBe('notstarted');
  });

  it('ladderProgress counts completed', () => {
    expect(ladderProgress(getState(), cond)).toMatchObject({ done: 0, total: 8 });
    setProblemStatus('ca1', 'completed');
    expect(ladderProgress(getState(), cond).done).toBe(1);
  });

  it('gymCounts aggregates statuses', () => {
    setProblemStatus('ca1', 'completed');
    setProblemStatus('ca2', 'review');
    const c = gymCounts(getState(), PROBLEMS);
    expect(c.completed).toBe(1);
    expect(c.review).toBe(1);
  });

  it('next/prev navigation within a ladder', () => {
    expect(nextProblemId(cond, 'ca1')).toBe('ca2');
    expect(nextProblemId(cond, cond.problemIds[cond.problemIds.length - 1])).toBeNull();
    expect(prevProblemId(cond, 'ca2')).toBe('ca1');
    expect(prevProblemId(cond, 'ca1')).toBeNull();
  });

  it('recommendedProblemId returns the first incomplete', () => {
    expect(recommendedProblemId(LADDERS, getState())).toBe('ca1');
    setProblemStatus('ca1', 'completed');
    expect(recommendedProblemId(LADDERS, getState())).toBe('ca2');
  });

  it('bossReady requires enough build-up rungs', () => {
    expect(bossReady(getState(), cond)).toBe(false);
  });

  it('quiz scoring and readiness', () => {
    const m = MODULES[0];
    expect(quizScore(m, getState().modules[m.id]).all).toBe(false);
    m.quiz.forEach((qq, i) => answerQuiz(m.id, i, qq.answer));
    setModuleComplete(m.id, true);
    expect(quizScore(m, getState().modules[m.id])).toMatchObject({ correct: 5, all: true });
    expect(readiness(getState(), MODULES)).toBe(100);
  });
});
