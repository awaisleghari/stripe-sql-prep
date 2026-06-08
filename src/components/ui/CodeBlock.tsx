import { useState } from 'react';
import { highlightSql } from '@/utils/highlightSql';

/** SQL code block: a window-chrome header (Copy never overlaps the code) + highlighted body. */
export function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(children).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span className="codeblock-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <button type="button" className={`codeblock-copy${copied ? ' done' : ''}`} onClick={copy} aria-label="Copy code">
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className="code">{highlightSql(children)}</pre>
    </div>
  );
}
