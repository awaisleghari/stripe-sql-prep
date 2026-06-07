import { describe, it, expect, beforeEach } from 'vitest';
import {
  getState, __resetForTests, setProblemStatus, focusProblem, setGymTab, answerQuiz, setModuleComplete, setRoute, setMockScore,
} from '@/state/progressStore';

beforeEach(() => __resetForTests());

describe('progress store', () => {
  it('starts on the dashboard with empty progress', () => {
    const s = getState();
    expect(s.route).toBe('dashboard');
    expect(Object.keys(s.problems)).toHaveLength(0);
    expect(s.gym.tab).toBe('path');
  });

  it('marks a problem completed (and implies attempted)', () => {
    setProblemStatus('ca1', 'completed');
    expect(getState().problems.ca1).toMatchObject({ completed: true, attempted: true });
  });

  it('flagging review clears on completion', () => {
    setProblemStatus('ca2', 'review');
    expect(getState().problems.ca2.needsReview).toBe(true);
    setProblemStatus('ca2', 'completed');
    expect(getState().problems.ca2.needsReview).toBe(false);
  });

  it('focusProblem switches to the focus tab and records the id', () => {
    focusProblem('ca2', 'cond');
    expect(getState().gym).toMatchObject({ tab: 'focus', focus: 'ca2', last: 'ca2', ladder: 'cond' });
  });

  it('records quiz answers and module completion', () => {
    answerQuiz('m1', 0, 1);
    setModuleComplete('m1', true);
    expect(getState().modules.m1).toMatchObject({ quiz: { 0: 1 }, complete: true });
  });

  it('setRoute and setGymTab mutate only their slice', () => {
    setRoute('gym');
    setGymTab('browse');
    expect(getState().route).toBe('gym');
    expect(getState().gym.tab).toBe('browse');
  });

  it('records mock self-scores per component/criterion', () => {
    setMockScore('m1_0', 0, 2);
    setMockScore('m1_0', 1, 1);
    expect(getState().mock['m1_0']).toMatchObject({ 0: 2, 1: 1 });
    const total = Object.values(getState().mock['m1_0']).reduce((a, b) => a + b, 0);
    expect(total).toBe(3);
  });
});
