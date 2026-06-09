/* Classify a raw Postgres error into a learner-facing explanation: what kind of problem it is
   (so they know whether it's their logic, a typo, or an unsupported feature) and what to do next. */

export type ErrorCategory = 'syntax' | 'missing_object' | 'dialect' | 'logic' | 'unknown';

export type ErrorExplanation = {
  category: ErrorCategory;
  label: string; // short human tag
  hint?: string; // likely cause
  action: string; // suggested next step
};

export function explainError(message: string): ErrorExplanation {
  const m = message.toLowerCase();

  if (m.includes('syntax error')) {
    return { category: 'syntax', label: 'Syntax error', hint: 'A missing comma or keyword, or an unbalanced parenthesis, near the position noted.', action: 'Read the SQL up to the position in the message and fix the punctuation/keyword there.' };
  }
  if (m.includes('column') && m.includes('does not exist')) {
    return { category: 'missing_object', label: 'Unknown column', hint: 'A column name is misspelled or belongs to a different table/alias.', action: 'Check the column against the Schema Explorer and qualify it with the right table alias.' };
  }
  if (m.includes('relation') && m.includes('does not exist')) {
    return { category: 'missing_object', label: 'Unknown table', hint: 'A table name is misspelled or not in this dataset.', action: 'Use one of the tables listed in the Schema Explorer.' };
  }
  if (m.includes('function') && m.includes('does not exist')) {
    return { category: 'dialect', label: 'Unknown function', hint: 'The function name/arguments may be wrong, or it is not available in this Postgres build.', action: 'Check the function name and argument types; cast arguments if needed (for example ::numeric).' };
  }
  if (m.includes('must appear in the group by')) {
    return { category: 'logic', label: 'GROUP BY', hint: 'A selected column is neither aggregated nor grouped.', action: 'Add the column to GROUP BY, or wrap it in an aggregate such as MAX().' };
  }
  if (m.includes('division by zero')) {
    return { category: 'logic', label: 'Division by zero', hint: 'A denominator evaluated to zero.', action: 'Guard the denominator with NULLIF(denominator, 0).' };
  }
  if (m.includes('window function') && (m.includes('where') || m.includes('group by') || m.includes('having'))) {
    return { category: 'logic', label: 'Window placement', hint: 'Window functions are computed after WHERE/GROUP BY/HAVING, so they cannot be used there.', action: 'Compute the window value in a CTE/subquery, then filter on it in an outer query.' };
  }
  if (m.includes('aggregate function calls cannot be nested')) {
    return { category: 'logic', label: 'Nested aggregate', hint: 'Aggregates cannot be nested directly.', action: 'Pre-aggregate in a CTE, then aggregate that result.' };
  }
  if (m.includes('is ambiguous')) {
    return { category: 'logic', label: 'Ambiguous column', hint: 'A column name exists in more than one joined table.', action: 'Qualify the column with its table alias (for example c.created_at).' };
  }
  if (m.includes('operator does not exist')) {
    return { category: 'logic', label: 'Type mismatch', hint: 'An operator was applied to incompatible types.', action: 'Cast one side so the types line up (for example ::numeric or ::date).' };
  }
  return { category: 'unknown', label: 'Query error', action: 'Read the message above, then adjust the query and run again.' };
}
