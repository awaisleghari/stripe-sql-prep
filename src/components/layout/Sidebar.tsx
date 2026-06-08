import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  ThunderboltOutlined,
  BranchesOutlined,
  AimOutlined,
  DatabaseOutlined,
  AlertOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { Route, Module } from '@/types';
import { MODULES } from '@/data/modules';
import { useProgress, setRoute, openModule } from '@/state/progressStore';

const { Sider } = Layout;

/** Theme name shown beside each day in the Learning Path rail. */
const DAY_THEME: Record<string, string> = {
  'Day 1': 'Foundations',
  'Day 2': 'Logic & Joins',
  'Day 3': 'Composition & Windows',
  'Day 4': 'Time & Patterns',
  'Day 5': 'Stripe Metrics',
};

function moduleLabel(id: string, title: string) {
  return (
    <span className="navmod">
      <span className="navmod-id">{id.toUpperCase()}</span>
      <span className="navmod-title">{title}</span>
    </span>
  );
}

/** Group modules under their day, preserving MODULES order. */
function dayGroups(): MenuProps['items'] {
  const order: string[] = [];
  const byDay: Record<string, Module[]> = {};
  for (const m of MODULES) {
    if (!byDay[m.day]) {
      byDay[m.day] = [];
      order.push(m.day);
    }
    byDay[m.day].push(m);
  }
  return order.map((day) => ({
    key: `grp-${day}`,
    type: 'group',
    label: DAY_THEME[day] ? `${day} · ${DAY_THEME[day]}` : day,
    children: byDay[day].map((m) => ({ key: m.id, label: moduleLabel(m.id, m.title) })),
  }));
}

const MODULE_IDS = new Set<string>(MODULES.map((m) => m.id));

const ITEMS: MenuProps['items'] = [
  {
    key: 'g-overview',
    type: 'group',
    label: 'Overview',
    children: [{ key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' }],
  },
  ...(dayGroups() ?? []),
  {
    key: 'g-practice',
    type: 'group',
    label: 'Practice',
    children: [
      { key: 'gym', icon: <ThunderboltOutlined />, label: 'Practice Gym' },
      { key: 'reason', icon: <BranchesOutlined />, label: 'Data reasoning → SQL' },
      { key: 'mock', icon: <AimOutlined />, label: 'Mock interviews' },
    ],
  },
  {
    key: 'g-reference',
    type: 'group',
    label: 'Reference',
    children: [
      { key: 'schema', icon: <DatabaseOutlined />, label: 'Schema explorer' },
      { key: 'panic', icon: <AlertOutlined />, label: 'Panic sheet' },
      { key: 'resources', icon: <LinkOutlined />, label: 'Resources' },
    ],
  },
];

export function Sidebar() {
  const state = useProgress();
  const selected = state.route === 'learn' ? state.activeModuleId ?? MODULES[0].id : state.route;
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
        selectedKeys={[selected]}
        items={ITEMS}
        onClick={({ key }) => (MODULE_IDS.has(key) ? openModule(key) : setRoute(key as Route))}
        style={{ borderInlineEnd: 0, background: 'transparent' }}
      />
    </Sider>
  );
}
