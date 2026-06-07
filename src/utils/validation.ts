import type { Problem } from '@/types';

/** Strings that would signal pandas-first teaching (forbidden — candidate is SQL-first). */
export const PANDAS_PATTERN = /DataFrame|df\.|groupby\(|pivot_table|np\.where/;

/** A problem must carry the guided-UX fields that make it coached rather than dumped. */
export function missingGuidedFields(p: Problem): string[] {
  const missing: string[] = [];
  if (!p.prompt) missing.push('prompt');
  if (!p.hints || p.hints.length === 0) missing.push('hints');
  if (!p.explain) missing.push('explain');
  if (!p.business && !p.task) missing.push('business/task');
  // exactly one context-in-play path
  const ctx = [p.schema?.length, p.inputSpec, p.context].filter(Boolean).length;
  if (ctx === 0) missing.push('context (schema|inputSpec|context)');
  // exactly one answer path (recognition/reasoning may use model; code uses solution)
  if (!p.solution && !p.model) missing.push('answer (solution|model)');
  return missing;
}
