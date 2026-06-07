import type { Route } from '@/types';
import { setRoute } from '@/state/progressStore';
import styles from './AppLayout.module.css';

const ITEMS: { route: Route; label: string }[] = [
  { route: 'dashboard', label: '🏠 Dashboard' },
  { route: 'learn', label: '📚 Learning path' },
  { route: 'gym', label: '🏋️ Practice Gym' },
  { route: 'schema', label: '🗄 Schema explorer' },
  { route: 'resources', label: '🔗 Resources' },
];

export function Sidebar({ active }: { active: Route }) {
  return (
    <aside className={styles.sider}>
      <div className={styles.brand}>Stripe Interview Prep</div>
      <div className={styles.brandsub}>Blended technical gym</div>
      <nav className={styles.nav}>
        {ITEMS.map((it) => (
          <button
            key={it.route}
            className={`${styles.navitem} ${active === it.route ? styles.active : ''}`}
            onClick={() => setRoute(it.route)}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
