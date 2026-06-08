import { RingProgress, Progress, Group, Stack, Text, SimpleGrid, Paper } from '@mantine/core';
import { IconBook2, IconBarbell, IconTargetArrow, IconLifebuoy } from '@tabler/icons-react';
import { MODULES } from '@/data/modules';
import { LADDERS, PROBLEMS, getProblem } from '@/data/gym';
import { MOCKS } from '@/data/mock';
import { RUBRICS } from '@/data/rubrics';
import type { Mode, Rubric } from '@/types';
import {
  useProgress, focusProblem, openModule, setRoute, setFilters, setGymTab,
} from '@/state/progressStore';
import { categoryCoverage } from '@/state/selectors';
import { blendedReadiness, mockReadiness } from '@/utils/scoring';
import { recommendedProblemId, ladderOf, nextInCategory } from '@/utils/problemNavigation';
import { weakAreas, type NudgeAction } from '@/utils/coaching';
import { DIFFICULTY_META, MODE_LABEL, MODE_ORDER } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Callout } from '@/components/ui/Callout';

const RUBRIC_BY_ID: Record<string, Rubric> = Object.fromEntries(RUBRICS.map((r) => [r.id, r]));

function Pillar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <Text w={92} fz="xs" fw={600} c="dimmed">{label}</Text>
      <Progress value={pct} color={color} size="md" radius="xl" style={{ flex: 1 }} />
      <Text w={40} ta="right" fz="xs" fw={700}>{pct}%</Text>
    </Group>
  );
}

export function Dashboard() {
  const state = useProgress();
  const blend = blendedReadiness(state, MODULES, PROBLEMS, MOCKS[0], RUBRIC_BY_ID);
  const mock = mockReadiness(state, MOCKS[0], RUBRIC_BY_ID);
  const cov = [...categoryCoverage(state, PROBLEMS)].sort((a, b) => MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode));
  const nudges = weakAreas(state, MODULES, PROBLEMS, mock.got);
  const recId = recommendedProblemId(LADDERS, state);
  const rec = getProblem(recId);
  const recLadder = rec ? ladderOf(LADDERS, rec.id) : undefined;

  const runAction = (a: NudgeAction) => {
    if (a.type === 'route') {
      if (a.value === 'gym') setGymTab('browse');
      setRoute(a.value as 'gym' | 'learn' | 'mock');
    } else if (a.type === 'problem') {
      const p = getProblem(a.value);
      if (p) focusProblem(p.id, p.ladder);
    } else {
      const id = nextInCategory(PROBLEMS, state, a.value as Mode);
      if (id) { const p = getProblem(id)!; focusProblem(p.id, p.ladder); }
      else { setFilters({ mode: a.value as Mode }); setGymTab('browse'); setRoute('gym'); }
    }
  };

  const practiceCategory = (mode: Mode) => {
    const id = nextInCategory(PROBLEMS, state, mode);
    if (id) { const p = getProblem(id)!; focusProblem(p.id, p.ladder); }
    else { setFilters({ mode }); setGymTab('browse'); setRoute('gym'); }
  };

  return (
    <div>
      {/* blended readiness hero */}
      <Card>
        <div className="section-label">Stripe interview readiness</div>
        <Group align="center" gap="xl" mt="sm" wrap="nowrap">
          <RingProgress
            size={132}
            thickness={11}
            roundCaps
            sections={[{ value: blend.overall, color: 'brand' }]}
            label={
              <div style={{ textAlign: 'center' }}>
                <Text fw={800} fz={26} c="brand" lh={1}>{blend.overall}%</Text>
                <Text fz="xs" c="dimmed">ready</Text>
              </div>
            }
          />
          <Stack gap={10} style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" c="dimmed">Blended across foundation, practice, and simulation.</Text>
            <Pillar label="Foundation" pct={blend.foundation} color="blue" />
            <Pillar label="Practice" pct={blend.practice} color="teal" />
            <Pillar label="Simulation" pct={blend.simulation} color="grape" />
          </Stack>
        </Group>
        <Text c="dimmed" fz={11.5} mt="sm">
          Foundation = modules made interview-ready · Practice = gym problems completed · Simulation = Mock 1 self-score
        </Text>
      </Card>

      {/* coaching nudges */}
      {nudges.length > 0 && (
        <Card>
          <div className="section-label" style={{ marginBottom: 8 }}>What to work on next</div>
          {nudges.map((n, i) => (
            <Callout key={i} variant={n.kind} title={n.kind === 'warn' ? '⚠ Gap' : '▸ Suggestion'}>
              <div>{n.text}</div>
              {n.action && (
                <div style={{ marginTop: 8 }}>
                  <Button small variant="primary" onClick={() => runAction(n.action!)}>{n.action.label} →</Button>
                </div>
              )}
            </Callout>
          ))}
        </Card>
      )}

      {/* recommended next problem */}
      {rec && (
        <Card>
          <div className="section-label">Recommended next problem</div>
          <Group gap={8} my="xs" align="center">
            <Text fw={700}>{rec.title}</Text>
            <Tag color={DIFFICULTY_META[rec.difficulty].color}>{DIFFICULTY_META[rec.difficulty].label}</Tag>
            {recLadder && <Tag color="geekblue">{recLadder.title}</Tag>}
          </Group>
          <Button variant="primary" onClick={() => focusProblem(rec.id, rec.ladder)}>Open in Focus Mode →</Button>
        </Card>
      )}

      {/* skill coverage by category */}
      <Card>
        <div className="section-label" style={{ marginBottom: 10 }}>Skill coverage by category</div>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {cov.map((c) => {
            const done = c.completed === c.total;
            return (
              <Paper key={c.mode} withBorder p="sm" radius="md">
                <Group justify="space-between" align="baseline">
                  <Text fw={650} size="sm">{MODE_LABEL[c.mode]}</Text>
                  <Text size="xs" fw={600} c={done ? 'teal' : 'dimmed'}>{c.completed}/{c.total}</Text>
                </Group>
                <Progress value={c.pct} color={done ? 'teal' : 'brand'} size="sm" radius="xl" my="sm" />
                <Button small onClick={() => practiceCategory(c.mode)}>
                  {done ? 'Review →' : c.completed ? 'Continue →' : 'Start →'}
                </Button>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Card>

      {/* quick links */}
      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Jump back in</div>
        <Group gap="xs">
          <Button leftSection={<IconBook2 size={16} />} onClick={() => openModule(MODULES[0].id)}>Learning path</Button>
          <Button leftSection={<IconBarbell size={16} />} onClick={() => setRoute('gym')}>Practice Gym</Button>
          <Button leftSection={<IconTargetArrow size={16} />} onClick={() => setRoute('mock')}>Mock interview</Button>
          <Button leftSection={<IconLifebuoy size={16} />} onClick={() => setRoute('panic')}>Panic sheet</Button>
        </Group>
      </Card>
    </div>
  );
}
