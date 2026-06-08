import { describe, it, expect } from 'vitest';
import { MODULES, getModule } from '@/data/modules';
import { MODULE_ROADMAP } from '@/data/modules/roadmap';
import { PROBLEMS, LADDERS, getProblem } from '@/data/gym';
import { SCHEMA } from '@/data/schema';
import { RESOURCES, RESOURCE_MAP } from '@/data/resources';
import { CAST } from '@/data/cast';
import { PYSQL } from '@/data/pysql';
import { MOCKS } from '@/data/mock';
import { PANIC } from '@/data/panic';
import { RUBRICS } from '@/data/rubrics';
import { TAG_COLORS, DIFFICULTY_META, PRIORITY_META } from '@/utils/formatters';
import { PANDAS_PATTERN, missingGuidedFields } from '@/utils/validation';
import type { Mode } from '@/types';

const VALID_MODES: Mode[] = ['SQL', 'Python', 'Pseudocode', 'DataLogic', 'Product', 'Experiment', 'Causal', 'Statistics', 'Object', 'Mixed'];

describe('module roadmap', () => {
  const slots = MODULE_ROADMAP.flatMap((d) => d.slots);

  it('lists every built module and never drops one', () => {
    const builtInRoadmap = slots.filter((s) => !s.locked).map((s) => s.id).sort();
    const built = MODULES.map((m) => m.id).sort();
    expect(builtInRoadmap).toEqual(built);
  });

  it('has unique, gap-free numbering m0..m16 with locked slots placeholders', () => {
    const ids = slots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length); // unique
    expect(ids).toEqual(Array.from({ length: ids.length }, (_, i) => `m${i}`)); // m0..mN in order
    // unlocked slots resolve to a real module; locked slots do not and carry a title
    for (const s of slots) {
      if (s.locked) {
        expect(getModule(s.id)).toBeUndefined();
        expect(s.lockedTitle && s.lockedTitle.length).toBeTruthy();
      } else {
        expect(getModule(s.id)).toBeTruthy();
      }
    }
  });
});

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

  it('has all 9 migrated modules, each with concept, predicts, debugs and exercises', () => {
    expect(MODULES.length).toBe(9);
    for (const m of MODULES) {
      expect(m.concept, `concept for ${m.id}`).toBeTruthy();
      expect(m.predicts.length, `predicts for ${m.id}`).toBeGreaterThanOrEqual(1);
      expect(m.debugs.length, `debugs for ${m.id}`).toBeGreaterThanOrEqual(1);
      expect(m.exercises.length, `exercises for ${m.id}`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('standalone pages', () => {
  it('has the migrated reasoning rows, mock components, and panic sections', () => {
    expect(PYSQL.length).toBe(16);
    expect(PANIC.length).toBe(5);
    expect(MOCKS[0].components.length).toBe(6);
  });
  it('every mock component references an existing rubric', () => {
    const ids = new Set(RUBRICS.map((r) => r.id));
    for (const c of MOCKS[0].components) expect(ids.has(c.rubric), `rubric ${c.rubric}`).toBe(true);
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
