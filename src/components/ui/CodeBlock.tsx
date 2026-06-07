import { useState } from 'react';
import { highlightSql } from '@/utils/highlightSql';

/** SQL code block with syntax highlighting and a copy-to-clipboard button. */
export function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(children).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="code-wrap">
      <button
        type="button"
        className={`code-copy${copied ? ' done' : ''}`}
        onClick={copy}
        aria-label="Copy code"
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
      <pre className="code">{highlightSql(children)}</pre>
    </div>
  );
}
