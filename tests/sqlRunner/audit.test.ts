import { describe, it, expect } from 'vitest';
import { compareResults } from '@/sqlRunner/compareResults';
import { explainError } from '@/sqlRunner/feedback';
import { problemRunnable, exerciseRunnable, statusForId, EXECUTABLE_OVERRIDES } from '@/sqlRunner/executable';
import type { RunResult } from '@/sqlRunner';

/* Pure (no PGlite) hardening tests: the comparison must never reject a correct answer over
   ordering, numeric precision, or alias/type differences; errors must classify clearly; and the
   executability registry must gate the Run button. The PGlite execution tests live in engine.test.ts. */

const grid = (columns: string[], rows: (string | number | boolean | null)[][]): RunResult => ({
  ok: true, columns, rows, rowCount: rows.length, elapsedMs: 0,
});

describe('compareResults — never rejects equivalent correct answers', () => {
  it('accepts identical sets in a different row order', () => {
    const a = grid(['v', 'rate'], [['control', '0.5600'], ['treatment', '0.6000']]);
    const b = grid(['v', 'rate'], [['treatment', '0.6000'], ['control', '0.5600']]);
    expect(compareResults(a, b).match).toBe(true);
  });

  it('ignores column alias/name differences (compares by position)', () => {
    const mine = grid(['variant', 'r'], [['control', 0.56]]);
    const ref = grid(['v', 'conversion_rate'], [['control', '0.5600']]);
    expect(compareResults(mine, ref).match).toBe(true);
  });

  it('treats numbers equal within 4 decimals and across string/number types', () => {
    expect(compareResults(grid(['x'], [['0.07140']]), grid(['x'], [[0.0714]])).match).toBe(true);
    expect(compareResults(grid(['n'], [['320']]), grid(['n'], [[320]])).match).toBe(true);
    expect(compareResults(grid(['r'], [[0.654321]]), grid(['r'], [['0.6543']])).match).toBe(true);
  });

  it('adds a non-blocking note (still a match) when the reference is ordered but order differs', () => {
    const mine = grid(['day', 'n'], [['2024-06-02', 5], ['2024-06-01', 3]]);
    const ref = grid(['day', 'n'], [['2024-06-01', 3], ['2024-06-02', 5]]);
    const c = compareResults(mine, ref, 'SELECT day, n FROM t ORDER BY day');
    expect(c.match).toBe(true);
    expect(c.note).toBeTruthy();
  });

  it('flags a column-count mismatch with a clear reason', () => {
    const c = compareResults(grid(['a', 'b'], [[1, 2]]), grid(['a'], [[1]]));
    expect(c.match).toBe(false);
    expect(c.kind).toBe('col_count');
  });

  it('flags a row-count mismatch with a clear reason', () => {
    const c = compareResults(grid(['x'], [[1], [2]]), grid(['x'], [[1]]));
    expect(c.match).toBe(false);
    expect(c.kind).toBe('row_count');
  });

  it('flags a value mismatch at equal shape and names a differing row', () => {
    const c = compareResults(grid(['x'], [[1], [2]]), grid(['x'], [[1], [3]]));
    expect(c.match).toBe(false);
    expect(c.kind).toBe('value');
    expect(c.reason).toMatch(/values differ/i);
  });

  it('refuses to compare when the learner query errored', () => {
    const bad: RunResult = { ok: false, columns: [], rows: [], rowCount: 0, elapsedMs: 0, error: 'boom' };
    const c = compareResults(bad, grid(['x'], [[1]]));
    expect(c.match).toBe(false);
    expect(c.kind).toBe('user_error');
  });
});

describe('explainError — classifies and suggests a next step', () => {
  it('classifies syntax errors', () => {
    const e = explainError('syntax error at or near "FORM"');
    expect(e.category).toBe('syntax');
    expect(e.action).toBeTruthy();
  });
  it('classifies a missing column as missing_object', () => {
    expect(explainError('column "emial" does not exist').category).toBe('missing_object');
  });
  it('classifies a missing table as missing_object', () => {
    expect(explainError('relation "chrages" does not exist').category).toBe('missing_object');
  });
  it('classifies an unknown function as dialect', () => {
    expect(explainError('function foo(integer) does not exist').category).toBe('dialect');
  });
  it('classifies GROUP BY / window / division errors as logic', () => {
    expect(explainError('column "x" must appear in the GROUP BY clause').category).toBe('logic');
    expect(explainError('window functions are not allowed in WHERE').category).toBe('logic');
    expect(explainError('division by zero').category).toBe('logic');
  });
});

describe('executability registry gates the Run button', () => {
  it('a normal SQL problem with a gold solution is runnable', () => {
    expect(problemRunnable({ id: 'an4', mode: 'SQL', solution: 'SELECT 1' })).toBe(true);
  });
  it('a non-SQL or solution-less problem is not runnable', () => {
    expect(problemRunnable({ id: 'x', mode: 'Python', solution: 'print(1)' })).toBe(false);
    expect(problemRunnable({ id: 'y', mode: 'SQL' })).toBe(false);
  });
  it('an overridden conceptual drill is not runnable, and carries a reason', () => {
    expect(statusForId('m1e4')).toBe('conceptual_only');
    expect(exerciseRunnable(true, { id: 'm1e4', solution: 'SELECT email FROM charges' })).toBe(false);
    expect(EXECUTABLE_OVERRIDES['m1e4'].reason).toBeTruthy();
  });
});
