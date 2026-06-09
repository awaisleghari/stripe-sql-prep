/* Turn PGlite's row-objects into a column/row grid with display-stable cells. */
import type { ErrorExplanation } from './feedback';

export type Cell = string | number | boolean | null;

export type RunResult = {
  ok: boolean;
  columns: string[];
  rows: Cell[][];
  rowCount: number;
  elapsedMs: number;
  error?: string;
  explain?: ErrorExplanation;
};

export type ComparisonKind = 'match' | 'col_count' | 'row_count' | 'value' | 'user_error';

export type Comparison = {
  match: boolean;
  reason: string;
  kind?: ComparisonKind;
  note?: string; // soft, non-blocking (e.g. row order differs but values match)
};

type PGResult = { rows: Array<Record<string, unknown>>; fields: Array<{ name: string }> };

export function normalizeCell(v: unknown): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v); // numeric/text come back as strings from pg; keep verbatim
}

export function normalizeResult(res: PGResult, elapsedMs: number): RunResult {
  const columns = (res.fields ?? []).map((f) => f.name);
  const rows = (res.rows ?? []).map((r) => columns.map((c) => normalizeCell(r[c])));
  return { ok: true, columns, rows, rowCount: rows.length, elapsedMs };
}

/** Display string for a cell (NULL rendered distinctly by the caller). */
export function displayCell(c: Cell): string {
  if (c === null) return 'NULL';
  if (typeof c === 'boolean') return c ? 'true' : 'false';
  return String(c);
}
