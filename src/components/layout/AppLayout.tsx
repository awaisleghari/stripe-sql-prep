import type { Route } from '@/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AppLayout.module.css';

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
    <div className={styles.shell}>
      <Sidebar active={route} />
      <div className={styles.main}>
        <Topbar title={TITLES[route]} readiness={readiness} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
