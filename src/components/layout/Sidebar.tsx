import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { Route } from '@/types';
import { setRoute } from '@/state/progressStore';

const { Sider } = Layout;

type NavItem = { route: Route; label: string; icon: string };

/** Grouped navigation — fewer top-level items per group keeps the rail uncluttered. */
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: [{ route: 'dashboard', label: 'Dashboard', icon: '🏠' }] },
  {
    title: 'Learn',
    items: [
      { route: 'learn', label: 'Learning path', icon: '📚' },
      { route: 'schema', label: 'Schema explorer', icon: '🗄' },
    ],
  },
  {
    title: 'Practice',
    items: [
      { route: 'gym', label: 'Practice Gym', icon: '🏋️' },
      { route: 'reason', label: 'Data reasoning → SQL', icon: '🔁' },
      { route: 'mock', label: 'Mock interviews', icon: '🎯' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { route: 'panic', label: 'Panic sheet', icon: '🚑' },
      { route: 'resources', label: 'Resources', icon: '🔗' },
    ],
  },
];

const MENU_ITEMS: MenuProps['items'] = GROUPS.map((group) => ({
  key: group.title,
  type: 'group',
  label: group.title,
  children: group.items.map((it) => ({
    key: it.route,
    label: it.label,
    icon: <span style={{ fontSize: 14, lineHeight: 1 }}>{it.icon}</span>,
  })),
}));

export function Sidebar({ active }: { active: Route }) {
  return (
    <Sider
      width={252}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        borderInlineEnd: '1px solid var(--split)',
      }}
    >
      <div className="brand-block">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">Stripe Interview Prep</div>
          <div className="brand-sub">Blended technical gym</div>
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[active]}
        items={MENU_ITEMS}
        onClick={({ key }) => setRoute(key as Route)}
        style={{ borderInlineEnd: 0, background: 'transparent' }}
      />
    </Sider>
  );
}
