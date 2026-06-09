/* Browser-only SQL execution sandbox (PGlite). Reached via dynamic import() from the
   console component so PGlite + the seed are code-split and loaded only on first Run. */
export { runSql, getDb } from './engine';
export { compareResults, looksOrdered } from './compareResults';
export { displayCell } from './normalizeResults';
export { REFERENCE_NOW } from './seedDatabase';
export { explainError } from './feedback';
export type { RunResult, Comparison, ComparisonKind, Cell } from './normalizeResults';
export type { ErrorExplanation, ErrorCategory } from './feedback';
