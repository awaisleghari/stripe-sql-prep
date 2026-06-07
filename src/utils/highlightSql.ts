import type { ReactNode } from 'react';
import { createElement } from 'react';

/**
 * Lightweight SQL syntax highlighter, ported from the original single-file build's `hl()`.
 * Returns an array of React nodes (plain strings + colored <span>s) rather than an HTML
 * string, so callers never touch dangerouslySetInnerHTML. Zero dependencies.
 *
 * Token colors live in src/styles/components.css (.hl-kw / .hl-fn / .hl-str / .hl-num / .hl-cm).
 */

// Longest phrases first so multi-word keywords win over their single-word substrings.
const KEYWORDS = [
  'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'PARTITION BY',
  'UNION ALL', 'CURRENT ROW', 'NULLS LAST', 'NULLS FIRST', 'IS DISTINCT FROM', 'IS NOT NULL',
  'IS NULL', 'NOT EXISTS', 'NOT IN', 'DATE_TRUNC', 'ROW_NUMBER', 'DENSE_RANK', 'BOOL_OR',
  'SELECT', 'FROM', 'WHERE', 'HAVING', 'LIMIT', 'JOIN', 'USING', 'ON', 'AND', 'OR', 'NOT',
  'IN', 'IS', 'NULL', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'COUNT', 'SUM',
  'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'NULLIF', 'OVER', 'ROWS', 'RANGE', 'UNBOUNDED',
  'PRECEDING', 'BETWEEN', 'INTERVAL', 'RANK', 'LAG', 'LEAD', 'FILTER', 'WITH', 'UNION', 'ROLLUP',
  'NOW', 'EXISTS', 'DESC', 'ASC', 'EXTRACT', 'TRUE', 'FALSE',
];

const KW_ALT = KEYWORDS.map((k) => k.replace(/ /g, '\\s+')).join('|');

// Order of alternation = precedence: comments & strings are consumed whole, so keywords
// or numbers inside them are never re-tokenized.
const TOKEN = new RegExp(
  '(\\/\\*[\\s\\S]*?\\*\\/)' + // 1 block comment
    '|(--[^\\n]*)' + //          2 line comment
    "|('(?:[^']|'')*')" + //     3 string literal
    `|\\b(${KW_ALT})\\b` + //    4 keyword
    '|(::\\w+)' + //             5 type cast (::int, ::numeric)
    '|\\b(\\d+\\.?\\d*)\\b', //  6 number
  'gi',
);

export function highlightSql(sql: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(sql)) !== null) {
    if (m.index > last) out.push(sql.slice(last, m.index));
    const [full, blockCm, lineCm, str, kw, cast, num] = m;
    let cls = '';
    if (blockCm || lineCm) cls = 'hl-cm';
    else if (str) cls = 'hl-str';
    else if (kw) cls = 'hl-kw';
    else if (cast) cls = 'hl-fn';
    else if (num) cls = 'hl-num';
    out.push(createElement('span', { key: key++, className: cls }, full));
    last = m.index + full.length;
    if (full.length === 0) TOKEN.lastIndex++; // defensive: never loop on a zero-width match
  }
  if (last < sql.length) out.push(sql.slice(last));
  return out;
}
