import { Layout, Progress } from 'antd';

const { Header } = Layout;

export function Topbar({ crumb, readiness }: { crumb: string; readiness: number }) {
  return (
    <Header
      style={{
        height: 62,
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(13,17,26,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--split)',
      }}
    >
      <span className="crumb">
        <span>Stripe Interview Prep</span>
        <span className="crumb-sep">/</span>
        <b>{crumb}</b>
      </span>
      <span style={{ flex: 1 }} />
      <div className="readiness-chip">
        <Progress
          type="circle"
          percent={readiness}
          size={34}
          strokeColor="#6e8efb"
          trailColor="rgba(255,255,255,0.08)"
        />
        <span className="rc-label">Interview readiness</span>
      </div>
    </Header>
  );
}
