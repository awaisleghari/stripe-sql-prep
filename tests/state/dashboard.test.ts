import { describe, it, expect, beforeEach } from 'vitest';
import { __resetForTests, getState, setProblemStatus, setMockScore } from '@/state/progressStore';
import { PROBLEMS } from '@/data/gym';
import { MODULES } from '@/data/modules';
import { MOCKS } from '@/data/mock';
import { RUBRICS } from '@/data/rubrics';
import { categoryCoverage } from '@/state/selectors';
import { nextInCategory } from '@/utils/problemNavigation';
import { mockReadiness, blendedReadiness } from '@/utils/scoring';
import { weakAreas } from '@/utils/coaching';

const rubricsById = Object.fromEntries(RUBRICS.map((r) => [r.id, r]));
beforeEach(() => __resetForTests());

describe('dashboard selectors', () => {
  it('categoryCoverage reflects completions per mode', () => {
    const sql0 = categoryCoverage(getState(), PROBLEMS).find((c) => c.mode === 'SQL')!;
    expect(sql0.total).toBe(40);
    expect(sql0.completed).toBe(0);
    setProblemStatus('ca1', 'completed');
    const sql1 = categoryCoverage(getState(), PROBLEMS).find((c) => c.mode === 'SQL')!;
    expect(sql1.completed).toBe(1);
  });

  it('nextInCategory walks the next incomplete of a mode', () => {
    expect(nextInCategory(PROBLEMS, getState(), 'SQL')).toBe('ca1');
    setProblemStatus('ca1', 'completed');
    expect(nextInCategory(PROBLEMS, getState(), 'SQL')).toBe('ca2');
  });

  it('mockReadiness sums self-scores over rubric maxima', () => {
    const empty = mockReadiness(getState(), MOCKS[0], rubricsById);
    expect(empty.got).toBe(0);
    expect(empty.max).toBe(82); // sql14+sql14+prod12+exp16+sql14+comm12
    setMockScore('m1_0', 0, 2);
    setMockScore('m1_0', 1, 2);
    expect(mockReadiness(getState(), MOCKS[0], rubricsById).got).toBe(4);
  });

  it('blendedReadiness starts at 0 and practice rises with completions', () => {
    expect(blendedReadiness(getState(), MODULES, PROBLEMS, MOCKS[0], rubricsById)).toMatchObject({ overall: 0, foundation: 0, practice: 0, simulation: 0 });
    setProblemStatus('ca1', 'completed');
    expect(blendedReadiness(getState(), MODULES, PROBLEMS, MOCKS[0], rubricsById).practice).toBe(Math.round((1 / PROBLEMS.length) * 100));
  });

  it('weakAreas flags SQL-only practice and missing Python', () => {
    ['ca1', 'ca2', 'ca3', 'ca4', 'ca5'].forEach((id) => setProblemStatus(id, 'completed'));
    const nudges = weakAreas(getState(), MODULES, PROBLEMS, 0);
    expect(nudges.length).toBeGreaterThan(0);
    const text = nudges.map((n) => n.text).join(' ');
    expect(text).toMatch(/Python/);
  });
});
