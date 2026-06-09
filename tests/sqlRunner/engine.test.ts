import { describe, it, expect } from 'vitest';
import { runSql, compareResults, REFERENCE_NOW } from '@/sqlRunner';
import type { RunResult } from '@/sqlRunner';
import { problemRunnable, exerciseRunnable, statusForId, overrideReason } from '@/sqlRunner/executable';
import { PROBLEMS, getProblem } from '@/data/gym';
import { MODULES } from '@/data/modules';
import { SCHEMA } from '@/data/schema';

/* Real PGlite execution audit. The whole reason for choosing PGlite over SQLite is fidelity:
   every Postgres gold solution in the curriculum must run as-written against the seeded, frozen
   sandbox. These boot the sandbox once (~2s) and prove it — hence the raised timeouts. */

const colIndex = (r: RunResult, name: string) => r.columns.indexOf(name);
const num = (v: unknown) => (v === null ? NaN : Number(v));

describe('PGlite sandbox: boot, determinism, schema', () => {
  it('boots, seeds, and answers a basic query', async () => {
    const r = await runSql('SELECT COUNT(*) AS n FROM charges');
    expect(r.ok).toBe(true);
    expect(num(r.rows[0][0])).toBeGreaterThan(1000);
  }, 60000);

  it('now() is frozen to REFERENCE_NOW (deterministic dates, no wall-clock)', async () => {
    const r = await runSql('SELECT now()::date AS d');
    expect(r.ok).toBe(true);
    expect(String(r.rows[0][colIndex(r, 'd')])).toContain(REFERENCE_NOW.slice(0, 10)); // 2024-07-01
  }, 60000);

  it('a NOW()-based gold solution returns identical results across runs', async () => {
    const sol = getProblem('an8')!.solution!;
    const a = await runSql(sol);
    const b = await runSql(sol);
    expect(a.ok && b.ok).toBe(true);
    expect(a.rowCount).toBe(b.rowCount);
  }, 60000);

  it('seed schema mirrors src/data/schema.ts exactly (tables and columns)', async () => {
    const r = await runSql(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position"
    );
    expect(r.ok).toBe(true);
    const seed: Record<string, Set<string>> = {};
    for (const row of r.rows) (seed[String(row[0])] ??= new Set()).add(String(row[1]));
    const doc: Record<string, Set<string>> = {};
    for (const t of SCHEMA) doc[t.name] = new Set(t.columns.map((c) => c.name));
    expect(Object.keys(seed).sort()).toEqual(Object.keys(doc).sort());
    for (const t of Object.keys(doc)) expect([...seed[t]].sort(), `columns of ${t}`).toEqual([...doc[t]].sort());
  }, 60000);
});

type AuditRow = { id: string; source: string; status: string; runs: boolean; rows: number; cols: string; note: string };

describe('PGlite sandbox: gold-solution audit gate', () => {
  it('every RUNNABLE gold solution (gym + drills) executes against the seed', async () => {
    const audit: AuditRow[] = [];
    const failures: { id: string; error?: string }[] = [];

    // displayId is for the report; statusId is the override-registry key (bare problem/exercise id).
    const record = async (displayId: string, statusId: string, source: string, solution: string, runnable: boolean) => {
      if (!runnable) {
        audit.push({ id: displayId, source, status: statusForId(statusId), runs: false, rows: 0, cols: '', note: overrideReason(statusId) ?? 'not executable' });
        return;
      }
      const r = await runSql(solution);
      audit.push({ id: displayId, source, status: 'ready', runs: r.ok, rows: r.rowCount, cols: r.columns.join(' '), note: r.ok ? '' : r.error ?? 'error' });
      if (!r.ok) failures.push({ id: displayId, error: r.error });
    };

    for (const p of PROBLEMS) {
      if (p.mode !== 'SQL' || !p.solution) continue;
      await record(p.id, p.id, `gym:${p.ladder}`, p.solution, problemRunnable(p));
    }
    for (const m of MODULES) {
      if (!m.sqlPattern) continue;
      for (const ex of m.exercises) {
        if (!ex.solution) continue;
        await record(`${m.id}/${ex.id}`, ex.id, `module:${m.id}`, ex.solution, exerciseRunnable(true, ex));
      }
    }

    // GATE: a problem is only marked runnable if its gold actually runs against the seed.
    if (failures.length) console.error('Runnable gold solutions that FAILED:\n' + failures.map((f) => `  ${f.id}: ${f.error}`).join('\n'));
    expect(failures).toEqual([]);

    const ready = audit.filter((a) => a.status === 'ready');
    const nonExec = audit.filter((a) => a.status !== 'ready');
    // eslint-disable-next-line no-console
    console.log(`AUDIT: ${ready.length} executable / ${ready.filter((a) => a.runs).length} passing / ${nonExec.length} non-executable. Full report via: npx vite-node scripts/sql-audit.mts`);
  }, 120000);
});

describe('PGlite sandbox: seed signals + equivalent-answer acceptance', () => {
  it('the failure spike makes the anomaly monitor (an8) flag a day', async () => {
    const r = await runSql(getProblem('an8')!.solution!);
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBeGreaterThanOrEqual(1);
  }, 60000);

  it('the dispute-rate spike (an5) flags at least one high-volume day', async () => {
    const r = await runSql(getProblem('an5')!.solution!);
    expect(r.ok).toBe(true);
    const ai = colIndex(r, 'is_anomaly');
    expect(r.rows.filter((row) => row[ai] === true).length).toBeGreaterThanOrEqual(1);
  }, 60000);

  it('the A/B readout (ab8) returns two arms with a positive baked lift and valid guardrails', async () => {
    const r = await runSql(getProblem('ab8')!.solution!);
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBe(2);
    const vi = colIndex(r, 'variant'), ci = colIndex(r, 'conversion_itt'), di = colIndex(r, 'dispute_rate');
    const by: Record<string, number[]> = {};
    for (const row of r.rows) by[String(row[vi])] = [num(row[ci]), num(row[di])];
    for (const v of ['control', 'treatment']) {
      expect(by[v][0]).toBeGreaterThan(0);
      expect(by[v][0]).toBeLessThanOrEqual(1);
      expect(by[v][1]).toBeGreaterThanOrEqual(0);
      expect(by[v][1]).toBeLessThanOrEqual(1);
    }
    expect(by['treatment'][0]).toBeGreaterThan(by['control'][0]);
  }, 60000);

  it('previously-empty drills now return rows against the seed (seed-coverage guard)', async () => {
    // These gold solutions used to return 0 rows (wrong/thin seed) and so were useless to a learner.
    // The seed now carries the entities and signals they need; lock that in.
    const ids = ['ca8', 'jn5', 'jn7', 'wn3', 'wn5', 'wn8', 'rf5', 'rf8'];
    for (const id of ids) {
      const r = await runSql(getProblem(id)!.solution!);
      expect(r.ok, `${id} runs`).toBe(true);
      expect(r.rowCount, `${id} returns rows`).toBeGreaterThanOrEqual(1);
    }
  }, 60000);

  it('accepts a logically-equivalent rewrite (different alias + order + no ROUND) as a match', async () => {
    // gold ab2: exposed customers per variant, ordered, aliased "exposed"
    const gold = getProblem('ab2')!.solution!;
    const rewrite =
      "SELECT variant, COUNT(DISTINCT customer_id) AS n FROM experiment_exposures WHERE experiment = 'checkout_v2' GROUP BY variant";
    const [g, mine] = [await runSql(gold), await runSql(rewrite)];
    expect(g.ok && mine.ok).toBe(true);
    expect(compareResults(mine, g, gold).match).toBe(true); // order/alias differences must not reject

    // an un-rounded rate must still match a 4dp-rounded reference (numeric tolerance), end-to-end
    const raw = await runSql('SELECT 1 AS k, (2.0/3.0)::numeric AS r');
    const rounded = await runSql('SELECT 1 AS k, ROUND(2.0/3.0, 4) AS r');
    expect(raw.ok && rounded.ok).toBe(true);
    expect(compareResults(raw, rounded).match).toBe(true);
  }, 60000);
});
