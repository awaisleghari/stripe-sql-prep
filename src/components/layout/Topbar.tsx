import { Layout, Progress, Typography } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

export function Topbar({ title, readiness }: { title: string; readiness: number }) {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 5,
        background: 'var(--bg-layout)',
      }}
    >
      <Text strong style={{ fontSize: 15 }}>
        {title}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text type="secondary" style={{ fontSize: 12.5 }}>
          Interview readiness
        </Text>
        <Progress
          type="circle"
          percent={readiness}
          size={40}
          strokeColor="#6e8efb"
          trailColor="rgba(255,255,255,0.08)"
        />
      </div>
    </Header>
  );
}
