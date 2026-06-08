import type { Route } from '@/types';
import { MODULES, getModule } from '@/data/modules';
import { useProgress } from '@/state/progressStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

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
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar crumb={crumb} readiness={readiness} />
        <main className="content">
          <div className="content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
