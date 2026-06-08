import { describe, it, expect } from 'vitest';
import { runSql, compareResults } from '@/sqlRunner';
import type { RunResult } from '@/sqlRunner';
import { PROBLEMS, getProblem } from '@/data/gym';
import { MODULES } from '@/data/modules';

/* The whole point of choosing PGlite (real Postgres in WASM) over SQLite is fidelity:
   every Postgres gold solution in the curriculum must execute as-written against the seeded
   sandbox. These tests boot the sandbox once and prove exactly that. They are slower than the
   data tests (a one-time ~2s boot), hence the raised timeout. */

const colIndex = (r: RunResult, name: string) => r.columns.indexOf(name);
const num = (v: unknown) => (v === null ? NaN : Number(v));

describe('PGlite sandbox executes the SQL curriculum', () => {
  it('boots, seeds, and answers a basic query', async () => {
    const r = await runSql('SELECT COUNT(*) AS n FROM charges');
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBe(1);
    expect(num(r.rows[0][0])).toBeGreaterThan(1000);
  }, 60000);

  // Intentional non-executable drills: their prompt explicitly assumes a column the real
  // schema does not have, as a pre-joins teaching simplification. Excluded from the must-run set.
  const NON_EXECUTABLE = new Set<string>(['m1/m1e4']); // prompt: "assume a charges.email column exists"

  it('every SQL gold solution (gym + module drills) runs without error', async () => {
    const failures: { id: string; error?: string }[] = [];

    for (const p of PROBLEMS) {
      if (p.mode !== 'SQL' || !p.solution || NON_EXECUTABLE.has(p.id)) continue;
      const r = await runSql(p.solution);
      if (!r.ok) failures.push({ id: p.id, error: r.error });
    }
    for (const m of MODULES) {
      if (!m.sqlPattern) continue;
      for (const ex of m.exercises) {
        if (!ex.solution || NON_EXECUTABLE.has(`${m.id}/${ex.id}`)) continue;
        const r = await runSql(ex.solution);
        if (!r.ok) failures.push({ id: `${m.id}/${ex.id}`, error: r.error });
      }
    }

    if (failures.length) {
      // surface exactly which solution failed and why
      console.error('Gold solutions that failed to run:\n' + failures.map((f) => `  ${f.id}: ${f.error}`).join('\n'));
    }
    expect(failures).toEqual([]);
  }, 120000);

  it('the engineered failure spike makes the anomaly monitor (an8) flag a day', async () => {
    const r = await runSql(getProblem('an8')!.solution!);
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBeGreaterThanOrEqual(1); // the +80-failure day clears z>3 and the 50-volume floor
  }, 60000);

  it('the dispute-rate spike (an5) flags at least one high-volume day', async () => {
    const r = await runSql(getProblem('an5')!.solution!);
    expect(r.ok).toBe(true);
    const ai = colIndex(r, 'is_anomaly');
    const flagged = r.rows.filter((row) => row[ai] === true).length;
    expect(flagged).toBeGreaterThanOrEqual(1); // the engineered day-6 dispute burst over the 200 floor
  }, 60000);

  it('the A/B readout (ab8) returns two arms with a positive baked lift and valid guardrails', async () => {
    const r = await runSql(getProblem('ab8')!.solution!);
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBe(2);
    const vi = colIndex(r, 'variant'), ci = colIndex(r, 'conversion_itt'), di = colIndex(r, 'dispute_rate');
    const byVariant: Record<string, number[]> = {};
    for (const row of r.rows) byVariant[String(row[vi])] = [num(row[ci]), num(row[di])];
    for (const v of ['control', 'treatment']) {
      expect(byVariant[v][0]).toBeGreaterThan(0); // conversion in (0,1]
      expect(byVariant[v][0]).toBeLessThanOrEqual(1);
      expect(byVariant[v][1]).toBeGreaterThanOrEqual(0); // dispute rate in [0,1]
      expect(byVariant[v][1]).toBeLessThanOrEqual(1);
    }
    expect(byVariant['treatment'][0]).toBeGreaterThan(byVariant['control'][0]); // baked ITT lift
  }, 60000);
});

describe('compareResults (pure, order/column-name-insensitive, 4dp tolerant)', () => {
  const grid = (columns: string[], rows: (string | number | boolean | null)[][]): RunResult => ({
    ok: true, columns, rows, rowCount: rows.length, elapsedMs: 0,
  });

  it('matches identical sets regardless of row order', () => {
    const a = grid(['v', 'rate'], [['control', '0.5600'], ['treatment', '0.6000']]);
    const b = grid(['variant', 'r'], [['treatment', '0.6000'], ['control', '0.5600']]);
    expect(compareResults(a, b).match).toBe(true);
  });

  it('treats numbers equal within 4 decimals', () => {
    const a = grid(['x'], [['0.07140']]);
    const b = grid(['x'], [[0.0714]]);
    expect(compareResults(a, b).match).toBe(true);
  });

  it('flags a differing row count', () => {
    const a = grid(['x'], [[1], [2]]);
    const b = grid(['x'], [[1]]);
    expect(compareResults(a, b).match).toBe(false);
  });

  it('flags differing contents at the same shape', () => {
    const a = grid(['x'], [[1], [2]]);
    const b = grid(['x'], [[1], [3]]);
    expect(compareResults(a, b).match).toBe(false);
  });

  it('refuses to compare when the user query errored', () => {
    const bad: RunResult = { ok: false, columns: [], rows: [], rowCount: 0, elapsedMs: 0, error: 'boom' };
    expect(compareResults(bad, grid(['x'], [[1]])).match).toBe(false);
  });
});
