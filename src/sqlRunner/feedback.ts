/* Map a raw Postgres error message to a one-line, learner-facing hint. Returns undefined
   when we have nothing better to add than the raw message. */
export function explainError(message: string): string | undefined {
  const m = message.toLowerCase();
  if (m.includes('syntax error')) return 'Syntax error — look for a missing comma or keyword, or an unbalanced parenthesis, near the position noted.';
  if (m.includes('column') && m.includes('does not exist')) return 'A column name does not exist. Check the spelling and that it belongs to the table alias you used (see the Schema Explorer).';
  if (m.includes('relation') && m.includes('does not exist')) return 'A table name does not exist. The available tables are in the Schema Explorer.';
  if (m.includes('must appear in the group by')) return 'A selected column is neither aggregated nor in GROUP BY. Add it to GROUP BY, or wrap it in an aggregate.';
  if (m.includes('division by zero')) return 'Division by zero — guard the denominator with NULLIF(denominator, 0).';
  if (m.includes('aggregate function calls cannot be nested')) return 'Aggregates cannot be nested directly. Pre-aggregate in a CTE, then aggregate the result.';
  if (m.includes('is ambiguous')) return 'A column reference is ambiguous across the joined tables — qualify it with its table alias.';
  if (m.includes('window function') && m.includes('group by')) return 'Window functions run after GROUP BY — compute the aggregate in a CTE first, then apply the window over it.';
  if (m.includes('operator does not exist')) return 'A type mismatch in an operator/comparison. Cast one side (for example ::numeric) so the types line up.';
  return undefined;
}
