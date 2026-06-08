import { Layout } from 'antd';
import type { Route } from '@/types';
import { MODULES, getModule } from '@/data/modules';
import { useProgress } from '@/state/progressStore';
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
  const { activeModuleId } = useProgress();
  const crumb =
    route === 'learn' ? getModule(activeModuleId ?? MODULES[0].id)?.title ?? TITLES.learn : TITLES[route];

  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Topbar crumb={crumb} readiness={readiness} />
        <Content style={{ padding: '30px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
