import { RingProgress, ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function Topbar({ crumb, readiness }: { crumb: string; readiness: number }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme !== 'light';

  return (
    <header className="app-topbar">
      <span className="crumb">
        <span>Stripe Interview Prep</span>
        <span className="crumb-sep">/</span>
        <b>{crumb}</b>
      </span>
      <span style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Tooltip label={dark ? 'Light mode' : 'Dark mode'} withArrow>
          <ActionIcon variant="default" size="lg" radius="md" onClick={toggleColorScheme} aria-label="Toggle color scheme">
            {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>
        <div className="readiness-chip">
          <RingProgress size={38} thickness={4} roundCaps sections={[{ value: readiness, color: 'brand' }]} />
          <span className="rc-label">
            Interview readiness <b>{readiness}%</b>
          </span>
        </div>
      </div>
    </header>
  );
}
