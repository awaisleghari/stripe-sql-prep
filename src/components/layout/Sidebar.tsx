import { NavLink, Text, Box } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconBarbell,
  IconRoute,
  IconTargetArrow,
  IconDatabase,
  IconLifebuoy,
  IconLink,
} from '@tabler/icons-react';
import type { Route, Module } from '@/types';
import { MODULES } from '@/data/modules';
import { useProgress, setRoute, openModule } from '@/state/progressStore';

const ICON = { size: 18, stroke: 1.7 };

type RouteItem = { route: Route; label: string; icon: React.ReactNode };

const OVERVIEW: RouteItem[] = [{ route: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard {...ICON} /> }];
const PRACTICE: RouteItem[] = [
  { route: 'gym', label: 'Practice Gym', icon: <IconBarbell {...ICON} /> },
  { route: 'reason', label: 'Data reasoning → SQL', icon: <IconRoute {...ICON} /> },
  { route: 'mock', label: 'Mock interviews', icon: <IconTargetArrow {...ICON} /> },
];
const REFERENCE: RouteItem[] = [
  { route: 'schema', label: 'Schema explorer', icon: <IconDatabase {...ICON} /> },
  { route: 'panic', label: 'Panic sheet', icon: <IconLifebuoy {...ICON} /> },
  { route: 'resources', label: 'Resources', icon: <IconLink {...ICON} /> },
];

const DAY_THEME: Record<string, string> = {
  'Day 1': 'Foundations',
  'Day 2': 'Logic & Joins',
  'Day 3': 'Composition & Windows',
  'Day 4': 'Time & Patterns',
  'Day 5': 'Stripe Metrics',
};

function dayGroups(): { day: string; label: string; mods: Module[] }[] {
  const order: string[] = [];
  const byDay: Record<string, Module[]> = {};
  for (const m of MODULES) {
    if (!byDay[m.day]) {
      byDay[m.day] = [];
      order.push(m.day);
    }
    byDay[m.day].push(m);
  }
  return order.map((day) => ({ day, label: DAY_THEME[day] ? `${day} · ${DAY_THEME[day]}` : day, mods: byDay[day] }));
}

const GROUPS = dayGroups();

export function Sidebar() {
  const state = useProgress();
  const selected = state.route === 'learn' ? state.activeModuleId ?? MODULES[0].id : state.route;

  return (
    <aside className="app-sider">
      <div className="brand-block">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">Stripe Interview Prep</div>
          <div className="brand-sub">Blended technical gym</div>
        </div>
      </div>

      <Box component="nav" className="app-nav" aria-label="Primary">
        <Text className="nav-group">Overview</Text>
        {OVERVIEW.map((it) => (
          <NavLink
            key={it.route}
            active={selected === it.route}
            label={it.label}
            leftSection={it.icon}
            onClick={() => setRoute(it.route)}
          />
        ))}

        {GROUPS.map((g) => (
          <div key={g.day}>
            <Text className="nav-group">{g.label}</Text>
            {g.mods.map((m) => (
              <NavLink
                key={m.id}
                active={selected === m.id}
                label={m.title}
                leftSection={<span className="navmod-id">{m.id.toUpperCase()}</span>}
                onClick={() => openModule(m.id)}
                styles={{ label: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
              />
            ))}
          </div>
        ))}

        <Text className="nav-group">Practice</Text>
        {PRACTICE.map((it) => (
          <NavLink
            key={it.route}
            active={selected === it.route}
            label={it.label}
            leftSection={it.icon}
            onClick={() => setRoute(it.route)}
          />
        ))}

        <Text className="nav-group">Reference</Text>
        {REFERENCE.map((it) => (
          <NavLink
            key={it.route}
            active={selected === it.route}
            label={it.label}
            leftSection={it.icon}
            onClick={() => setRoute(it.route)}
          />
        ))}
      </Box>
    </aside>
  );
}
