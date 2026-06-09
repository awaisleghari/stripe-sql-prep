import type { Cell, RunResult, Comparison } from './normalizeResults';
import { displayCell } from './normalizeResults';

/*
 * Compare a learner's result to the reference result as an unordered MULTISET, compared by
 * column POSITION (so alias names never matter) with numbers canonicalised to 4 decimals (the
 * app's four-decimal convention). Pass/fail is ALWAYS order-insensitive — it never rejects a
 * correct answer because the rows came back in a different order, which also sidesteps the
 * nondeterministic tie-ordering of ORDER BY. When the reference is ordered and the sets match
 * but the learner's order differs, a non-blocking note is attached. This is a "your output
 * matches" check, not an authoritative grade — two different queries can yield the same grid.
 */
export function compareResults(user: RunResult, reference: RunResult, referenceSql?: string): Comparison {
  if (!user.ok) return { match: false, kind: 'user_error', reason: 'Fix the error in your query first, then check it against the reference.' };
  if (user.columns.length !== reference.columns.length)
    return {
      match: false,
      kind: 'col_count',
      reason: `Column count differs — yours returns ${user.columns.length} column(s), the reference returns ${reference.columns.length}. Select exactly the columns the prompt asks for, in that order (the names themselves are not graded).`,
    };
  if (user.rowCount !== reference.rowCount)
    return {
      match: false,
      kind: 'row_count',
      reason: `Row count differs — yours returned ${user.rowCount} row(s), the reference returned ${reference.rowCount}. Re-check your filters, the GROUP BY grain, and any DISTINCT.`,
    };

  const uKeys = user.rows.map(serializeRow);
  const rKeys = reference.rows.map(serializeRow);
  const uCount = countMap(uKeys);
  const rCount = countMap(rKeys);

  let extraIdx = -1;
  for (let i = 0; i < uKeys.length; i++) if ((rCount.get(uKeys[i]) ?? 0) !== uCount.get(uKeys[i])) { extraIdx = i; break; }
  let missingIdx = -1;
  for (let i = 0; i < rKeys.length; i++) if ((uCount.get(rKeys[i]) ?? 0) !== rCount.get(rKeys[i])) { missingIdx = i; break; }

  if (extraIdx >= 0 || missingIdx >= 0) {
    const parts: string[] = [];
    if (extraIdx >= 0) parts.push(`a row you returned that the reference does not have: [${preview(user.rows[extraIdx])}]`);
    if (missingIdx >= 0) parts.push(`a row the reference has that yours is missing: [${preview(reference.rows[missingIdx])}]`);
    return { match: false, kind: 'value', reason: `Same shape, but values differ — ${parts.join('; ')}. Compare against the reference grid below.` };
  }

  // matched as a set; attach a soft note if the reference is ordered and the learner's order differs
  if (referenceSql && looksOrdered(referenceSql)) {
    const sameOrder = uKeys.length === rKeys.length && uKeys.every((k, i) => k === rKeys[i]);
    if (!sameOrder) {
      return {
        match: true,
        kind: 'match',
        reason: 'Your output matches the reference result.',
        note: 'The reference sorts the rows (ORDER BY); row order is not graded, so your answer still counts as correct.',
      };
    }
  }
  return { match: true, kind: 'match', reason: 'Your output matches the reference result.' };
}

function countMap(keys: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

function preview(row: Cell[]): string {
  const s = row.map(displayCell).join(', ');
  return s.length > 80 ? s.slice(0, 77) + '…' : s;
}

function serializeRow(row: Cell[]): string {
  return row.map(canon).join('');
}

function canon(c: Cell): string {
  if (c === null) return '∅';
  if (typeof c === 'boolean') return c ? 't' : 'f';
  const s = String(c).trim();
  // numeric-looking → round to 4dp so 0.0714, 0.07140 and 0.071399 all compare equal
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isNaN(n)) return n.toFixed(4);
  }
  return s;
}

/** True when the query has ORDER BY at the top level (parenthesised window/subquery ORDER BY ignored). */
export function looksOrdered(sql: string): boolean {
  let flat = sql;
  // repeatedly strip innermost parenthesised groups so window/subquery ORDER BY don't count
  let prev: string;
  do {
    prev = flat;
    flat = flat.replace(/\([^()]*\)/g, ' ');
  } while (flat !== prev);
  return /\border\s+by\b/i.test(flat);
}
