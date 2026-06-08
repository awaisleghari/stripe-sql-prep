import { NavLink, Text, Box } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconBarbell,
  IconRoute,
  IconTargetArrow,
  IconDatabase,
  IconLifebuoy,
  IconLink,
  IconLock,
} from '@tabler/icons-react';
import type { Route } from '@/types';
import { MODULES, getModule } from '@/data/modules';
import { MODULE_ROADMAP } from '@/data/modules/roadmap';
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

const LABEL_STYLES = { label: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const;

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
          <NavLink key={it.route} active={selected === it.route} label={it.label} leftSection={it.icon} onClick={() => setRoute(it.route)} />
        ))}

        {MODULE_ROADMAP.map((d) => (
          <div key={d.day}>
            <Text className="nav-group">{d.day} · {d.theme}</Text>
            {d.slots.map((s) =>
              s.locked ? (
                <NavLink
                  key={s.id}
                  disabled
                  label={s.lockedTitle}
                  leftSection={<span className="navmod-id navmod-id-locked">{s.id.toUpperCase()}</span>}
                  rightSection={<IconLock size={13} stroke={1.8} />}
                  styles={LABEL_STYLES}
                />
              ) : (
                <NavLink
                  key={s.id}
                  active={selected === s.id}
                  label={getModule(s.id)?.title ?? s.id.toUpperCase()}
                  leftSection={<span className="navmod-id">{s.id.toUpperCase()}</span>}
                  onClick={() => openModule(s.id)}
                  styles={LABEL_STYLES}
                />
              ),
            )}
          </div>
        ))}

        <Text className="nav-group">Practice</Text>
        {PRACTICE.map((it) => (
          <NavLink key={it.route} active={selected === it.route} label={it.label} leftSection={it.icon} onClick={() => setRoute(it.route)} />
        ))}

        <Text className="nav-group">Reference</Text>
        {REFERENCE.map((it) => (
          <NavLink key={it.route} active={selected === it.route} label={it.label} leftSection={it.icon} onClick={() => setRoute(it.route)} />
        ))}
      </Box>
    </aside>
  );
}
