import { SEED_SQL } from './seedDatabase';
import { normalizeResult, type RunResult } from './normalizeResults';
import { explainError } from './feedback';

/*
 * Lazy, single-instance in-browser Postgres (PGlite/WASM). The whole module — including the
 * generated SEED_SQL and the ~7MB WASM — is reached only through a dynamic import() from the
 * console component, so it is code-split into its own chunk and loaded on the first "Run".
 *
 * The database is created and seeded exactly once (memoised Promise) and stays warm for the
 * rest of the session. Browser-only: no backend, no network, no remote grading (CLAUDE.md §11).
 */

type PGliteInstance = {
  query: (sql: string) => Promise<{ rows: Array<Record<string, unknown>>; fields: Array<{ name: string }> }>;
  exec: (sql: string) => Promise<unknown>;
};

let dbPromise: Promise<PGliteInstance> | null = null;

/** Boot + seed the sandbox once; subsequent calls return the warm instance. */
export function getDb(): Promise<PGliteInstance> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { PGlite } = await import('@electric-sql/pglite');
      const db = (await PGlite.create()) as unknown as PGliteInstance;
      await db.exec(SEED_SQL);
      return db;
    })().catch((e) => {
      dbPromise = null; // allow a retry on the next Run if boot failed
      throw e;
    });
  }
  return dbPromise;
}

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

const empty = (over: Partial<RunResult>): RunResult => ({ ok: false, columns: [], rows: [], rowCount: 0, elapsedMs: 0, ...over });

/** Execute one SQL statement against the seeded sandbox and return a normalized grid. */
export async function runSql(sql: string): Promise<RunResult> {
  const trimmed = sql.trim().replace(/;\s*$/, '');
  if (!trimmed) return empty({ error: 'Write a query first.' });

  let db: PGliteInstance;
  try {
    db = await getDb();
  } catch (e) {
    return empty({ error: 'Could not start the in-browser database: ' + msg(e) });
  }

  const start = now();
  try {
    const res = await db.query(trimmed);
    return normalizeResult(res, Math.round(now() - start));
  } catch (e) {
    const error = msg(e);
    return empty({ elapsedMs: Math.round(now() - start), error, explain: explainError(error) });
  }
}
