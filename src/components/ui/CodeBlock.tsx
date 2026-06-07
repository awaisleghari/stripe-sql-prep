/** Plain preformatted code. (SQL highlighting can be added later without touching callers.) */
export function CodeBlock({ children }: { children: string }) {
  return <pre className="code">{children}</pre>;
}
