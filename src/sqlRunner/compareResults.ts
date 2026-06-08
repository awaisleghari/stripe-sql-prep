import type { Cell, RunResult, Comparison } from './normalizeResults';

/*
 * Compare a learner's result to the reference result as a MULTISET (order-insensitive,
 * column-name-insensitive, compared by position). Numbers are canonicalised to 4 decimals
 * (the app's four-decimal convention) so 0.0714 and 0.07140 match. This is a "your output
 * matches" check, not an authoritative grade — two different queries can yield the same grid.
 */
export function compareResults(user: RunResult, reference: RunResult): Comparison {
  if (!user.ok) return { match: false, reason: 'Fix the error in your query first, then check it.' };
  if (user.columns.length !== reference.columns.length)
    return { match: false, reason: `Column count differs — yours has ${user.columns.length}, the reference has ${reference.columns.length}.` };
  if (user.rowCount !== reference.rowCount)
    return { match: false, reason: `Row count differs — yours returned ${user.rowCount}, the reference returned ${reference.rowCount}.` };

  const u = user.rows.map(serializeRow).sort();
  const r = reference.rows.map(serializeRow).sort();
  for (let i = 0; i < u.length; i++) {
    if (u[i] !== r[i]) {
      return { match: false, reason: 'Same shape, but the row contents differ. Compare your output to the reference grid below.' };
    }
  }
  return { match: true, reason: 'Your output matches the reference result.' };
}

function serializeRow(row: Cell[]): string {
  return row.map(canon).join('');
}

function canon(c: Cell): string {
  if (c === null) return '∅';
  if (typeof c === 'boolean') return c ? 't' : 'f';
  const s = String(c).trim();
  // numeric-looking → round to 4dp for tolerant comparison
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isNaN(n)) return n.toFixed(4);
  }
  return s;
}

/** True when the query has ORDER BY at the top level (best-effort; window ORDER BY ignored). */
export function looksOrdered(sql: string): boolean {
  // strip parenthesised groups (windows, subqueries) then look for a trailing ORDER BY
  const flat = sql.replace(/\([^()]*\)/g, ' ');
  return /\border\s+by\b/i.test(flat);
}
