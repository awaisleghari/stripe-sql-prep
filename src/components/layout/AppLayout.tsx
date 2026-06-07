import { Layout } from 'antd';
import type { Route } from '@/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const { Content } = Layout;

const TITLES: Record<Route, string> = {
  dashboard: 'Dashboard',
  learn: 'Learning path',
  gym: 'Practice Gym',
  schema: 'Schema explorer',
  resources: 'Resources',
  reason: 'Data reasoning → SQL',
  mock: 'Mock interviews',
  panic: 'Panic sheet',
};

export function AppLayout({ route, readiness, children }: { route: Route; readiness: number; children: React.ReactNode }) {
  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      <Sidebar active={route} />
      <Layout>
        <Topbar title={TITLES[route]} readiness={readiness} />
        <Content style={{ padding: '28px' }}>
          <div style={{ maxWidth: 980 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
