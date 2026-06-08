import { RingProgress } from '@mantine/core';

export function Topbar({ crumb, readiness }: { crumb: string; readiness: number }) {
  return (
    <header className="app-topbar">
      <span className="crumb">
        <span>Stripe Interview Prep</span>
        <span className="crumb-sep">/</span>
        <b>{crumb}</b>
      </span>
      <span style={{ flex: 1 }} />
      <div className="readiness-chip">
        <RingProgress
          size={38}
          thickness={4}
          roundCaps
          sections={[{ value: readiness, color: 'brand' }]}
        />
        <span className="rc-label">
          Interview readiness <b>{readiness}%</b>
        </span>
      </div>
    </header>
  );
}
