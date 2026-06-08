/**
 * Wrap bare SQL keywords and snake_case identifiers in authored prose with inline
 * code chips, so a hint like "pure SELECT — no WHERE, no GROUP BY" reads with the
 * same highlighted vocabulary as the code blocks.
 *
 * Safe on HTML strings: the input is split on tags and only text that is NOT already
 * inside a <code> element is transformed, so existing markup is never touched or
 * double-wrapped. Keyword matching is case-sensitive (uppercase only) so ordinary
 * English words are never chipped.
 */

// Uppercase forms that read as SQL when written in prose. Longest phrases first.
const PROSE_KW = [
  'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'PARTITION BY',
  'UNION ALL', 'ROW_NUMBER', 'DENSE_RANK', 'SELECT', 'WHERE', 'HAVING', 'LIMIT', 'JOIN', 'DISTINCT',
  'COUNT', 'COALESCE', 'NULLIF', 'OVER', 'RANK', 'LAG', 'LEAD', 'UNION', 'NULL',
];

const KW_RE = new RegExp(`\\b(${PROSE_KW.map((k) => k.replace(/ /g, '\\s+')).join('|')})\\b`, 'g');
const SNAKE_RE = /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g;
const chip = (m: string) => `<code class="inline">${m}</code>`;

export function wrapProse(input: string): string {
  let inCode = 0;
  return input
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<code\b/i.test(part)) inCode++;
        else if (/^<\/code/i.test(part)) inCode = Math.max(0, inCode - 1);
        return part;
      }
      if (inCode > 0 || !part) return part;
      return part.replace(KW_RE, chip).replace(SNAKE_RE, chip);
    })
    .join('');
}
