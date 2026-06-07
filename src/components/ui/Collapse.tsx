export function Collapse({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="collapse" open={open}>
      <summary>{title}</summary>
      <div className="collapse-body">{children}</div>
    </details>
  );
}
