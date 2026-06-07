import { describe, it, expect } from 'vitest';
import { MODULES } from '@/data/modules';
import { PROBLEMS, LADDERS, getProblem } from '@/data/gym';
import { TAG_COLORS, DIFFICULTY_META, PRIORITY_META } from '@/utils/formatters';
import { PANDAS_PATTERN, missingGuidedFields } from '@/utils/validation';
import type { Mode } from '@/types';

const VALID_MODES: Mode[] = ['SQL', 'Python', 'Pseudocode', 'DataLogic', 'Product', 'Experiment', 'Causal', 'Statistics', 'Object', 'Mixed'];

describe('problem data integrity', () => {
  it('every problem has the required identity fields', () => {
    for (const p of PROBLEMS) {
      expect(p.id, 'id').toBeTruthy();
      expect(p.title, `title for ${p.id}`).toBeTruthy();
      expect(p.ladder, `ladder for ${p.id}`).toBeTruthy();
      expect(Object.keys(DIFFICULTY_META), `difficulty for ${p.id}`).toContain(p.difficulty);
      expect(Object.keys(PRIORITY_META), `priority for ${p.id}`).toContain(p.priority);
      expect(VALID_MODES, `mode for ${p.id}`).toContain(p.mode);
    }
  });

  it('every problem carries the guided-UX fields', () => {
    for (const p of PROBLEMS) {
      expect(missingGuidedFields(p), `guided fields missing for ${p.id}`).toEqual([]);
    }
  });

  it('has no duplicate problem ids', () => {
    const ids = PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every ladder references only existing problems', () => {
    for (const l of LADDERS) {
      for (const pid of l.problemIds) {
        expect(getProblem(pid), `${l.id} references missing ${pid}`).toBeDefined();
      }
    }
  });

  it('uses only defined tag colors in difficulty/priority maps', () => {
    for (const meta of [...Object.values(DIFFICULTY_META), ...Object.values(PRIORITY_META)]) {
      expect(TAG_COLORS).toContain(meta.color);
    }
  });

  it('contains no pandas-first language', () => {
    const blob = JSON.stringify(PROBLEMS) + JSON.stringify(MODULES);
    expect(PANDAS_PATTERN.test(blob)).toBe(false);
  });
});

describe('module data integrity', () => {
  it('every module quiz has exactly 5 questions, one per level 0..4', () => {
    for (const m of MODULES) {
      expect(m.quiz.length, `quiz length for ${m.id}`).toBe(5);
      for (const q of m.quiz) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });
});
