import { describe, it, expect } from 'vitest';
import { MODULES } from '@/data/modules';
import { PROBLEMS, LADDERS, getProblem } from '@/data/gym';
import { SCHEMA } from '@/data/schema';
import { RESOURCES, RESOURCE_MAP } from '@/data/resources';
import { CAST } from '@/data/cast';
import { TAG_COLORS, DIFFICULTY_META, PRIORITY_META } from '@/utils/formatters';
import { PANDAS_PATTERN, missingGuidedFields } from '@/utils/validation';
import type { Mode } from '@/types';

const VALID_MODES: Mode[] = ['SQL', 'Python', 'Pseudocode', 'DataLogic', 'Product', 'Experiment', 'Causal', 'Statistics', 'Object', 'Mixed'];

describe('migrated dataset size', () => {
  it('has all 68 problems and 9 ladders', () => {
    expect(PROBLEMS.length).toBe(68);
    expect(LADDERS.length).toBe(9);
  });
  it('every ladder problem-count matches its problemIds', () => {
    const byLadder: Record<string, number> = {};
    for (const p of PROBLEMS) byLadder[p.ladder] = (byLadder[p.ladder] ?? 0) + 1;
    for (const l of LADDERS) expect(byLadder[l.id], `count for ${l.id}`).toBe(l.problemIds.length);
  });
});

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

  it('every ladder references only existing problems, and every problem belongs to its ladder', () => {
    for (const l of LADDERS) {
      for (const pid of l.problemIds) {
        const p = getProblem(pid);
        expect(p, `${l.id} references missing ${pid}`).toBeDefined();
        expect(p!.ladder, `${pid}.ladder should be ${l.id}`).toBe(l.id);
      }
    }
  });

  it('uses only defined tag colors', () => {
    for (const meta of [...Object.values(DIFFICULTY_META), ...Object.values(PRIORITY_META)]) {
      expect(TAG_COLORS).toContain(meta.color);
    }
    for (const c of CAST) expect(TAG_COLORS, `cast tag ${c.id}`).toContain(c.tag);
  });

  it('contains no pandas-first language', () => {
    const blob = JSON.stringify(PROBLEMS) + JSON.stringify(MODULES);
    expect(PANDAS_PATTERN.test(blob)).toBe(false);
  });
});

describe('module data integrity', () => {
  it('every module quiz has exactly 5 questions with a valid answer index', () => {
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

describe('supporting data', () => {
  it('schema/resources/cast are non-empty and resource maps resolve', () => {
    expect(SCHEMA.length).toBe(11);
    expect(RESOURCES.length).toBeGreaterThan(0);
    expect(CAST.length).toBeGreaterThan(0);
    for (const [name, map] of Object.entries(RESOURCE_MAP)) {
      const known = map.mode
        ? VALID_MODES.includes(map.mode)
        : map.ladder
          ? LADDERS.some((l) => l.id === map.ladder)
          : !!map.source;
      expect(known, `resource map for ${name}`).toBe(true);
    }
  });
});
