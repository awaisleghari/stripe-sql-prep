export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="progress" style={{ flex: 1 }}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--t-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {value} / {total} done
      </span>
    </div>
  );
}
