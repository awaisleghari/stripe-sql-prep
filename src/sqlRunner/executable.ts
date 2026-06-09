/*
 * Executability registry for the in-browser SQL runner.
 *
 * A SQL problem/drill is RUNNABLE only when its gold solution actually executes against the
 * seeded PGlite sandbox. Most do (status "ready"); the exceptions are listed here with a reason
 * so the UI can hide the Run button and the audit test can assert they are correctly excluded.
 *
 * This module is pure (no PGlite import) so view components can gate on it without pulling the
 * ~7MB engine into the main bundle. The audit test (tests/sqlRunner/audit.test.ts) is the
 * enforcement: every non-overridden SQL gold solution MUST run, or the build fails.
 */

export type ExecutableStatus =
  | 'ready' //            gold solution runs against the seed; Run + Check enabled
  | 'needs_seed_data' //  references a table/column the seed doesn't populate
  | 'unsupported_sql' //  uses a Postgres feature PGlite cannot run
  | 'conceptual_only' //  intentionally non-executable (e.g. assumes a column for teaching)
  | 'needs_gold_rewrite'; // gold solution is wrong/non-executable and awaits a rewrite

/** Reasons a specific problem/exercise id is NOT runnable. Anything absent defaults to "ready". */
export const EXECUTABLE_OVERRIDES: Record<string, { status: ExecutableStatus; reason: string }> = {
  // m1e4's prompt explicitly says "assume a charges.email column exists" (a pre-joins teaching
  // simplification); the real schema has no charges.email, so its gold cannot run.
  m1e4: { status: 'conceptual_only', reason: 'Prompt assumes a charges.email column the schema does not have (pre-joins simplification).' },
};

const NON_READY = new Set<ExecutableStatus>(['needs_seed_data', 'unsupported_sql', 'conceptual_only', 'needs_gold_rewrite']);

/** Status for any id, defaulting to "ready" when there is a SQL gold solution and no override. */
export function statusForId(id: string): ExecutableStatus {
  return EXECUTABLE_OVERRIDES[id]?.status ?? 'ready';
}

export function overrideReason(id: string): string | undefined {
  return EXECUTABLE_OVERRIDES[id]?.reason;
}

/** A gym problem is runnable iff it is SQL, has a gold solution, and is not overridden non-ready. */
export function problemRunnable(p: { id: string; mode?: string; solution?: string }): boolean {
  if (p.mode !== 'SQL' || !p.solution) return false;
  return !NON_READY.has(statusForId(p.id));
}

/** A module drill is runnable iff its module is SQL-flavoured, it has a gold, and is not overridden. */
export function exerciseRunnable(moduleIsSql: boolean, ex: { id: string; solution?: string }): boolean {
  if (!moduleIsSql || !ex.solution) return false;
  return !NON_READY.has(statusForId(ex.id));
}
