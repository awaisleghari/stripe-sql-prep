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

/** Standalone pages each get a coherent hue (modules/gym set their own per-tab). */
const ROUTE_ACCENT: Partial<Record<Route, string>> = {
  reason: '#6f9bff',
  mock: '#b692f6',
  schema: '#4dc9d6',
  panic: '#f0976b',
  resources: '#46c98b',
};

export function AppLayout({ route, readiness, children }: { route: Route; readiness: number; children: React.ReactNode }) {
  const { activeModuleId } = useProgress();
  const crumb =
    route === 'learn' ? getModule(activeModuleId ?? MODULES[0].id)?.title ?? TITLES.learn : TITLES[route];
  const accent = ROUTE_ACCENT[route];

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar crumb={crumb} readiness={readiness} />
        <main className="content">
          <div
            className={accent ? 'content-inner tab-accent' : 'content-inner'}
            style={accent ? ({ ['--accent' as string]: accent } as React.CSSProperties) : undefined}
            key={route}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
