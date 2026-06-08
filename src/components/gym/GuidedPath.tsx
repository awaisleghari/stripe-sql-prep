import { Group, Stack, Text, ThemeIcon, Badge, UnstyledButton } from '@mantine/core';
import { LADDERS, getProblem } from '@/data/gym';
import { useProgress, selectLadder, focusProblem } from '@/state/progressStore';
import { ladderProgress, problemStatus, bossReady } from '@/state/selectors';
import { ladderNextId } from '@/utils/problemNavigation';
import { DIFFICULTY_META } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

const RING_COLOR = { completed: 'teal', review: 'yellow', here: 'brand', todo: 'gray' } as const;

export function GuidedPath() {
  const state = useProgress();
  const ladder = LADDERS.find((l) => l.id === state.gym.ladder) ?? LADDERS[0];
  const pr = ladderProgress(state, ladder);
  const hereId = ladderNextId(ladder, state);
  const sql = LADDERS.filter((l) => l.category !== 'skill');
  const skill = LADDERS.filter((l) => l.category === 'skill');

  return (
    <div>
      <div className="section-label">Choose a ladder</div>
      <div className="section-label" style={{ margin: '8px 0 4px' }}>SQL ladders</div>
      <Group gap={6} mb="sm">
        {sql.map((l) => {
          const p = ladderProgress(state, l);
          return (
            <Button key={l.id} small variant={l.id === ladder.id ? 'primary' : 'default'} onClick={() => selectLadder(l.id)}>
              {l.title} · {p.done}/{p.total}
            </Button>
          );
        })}
      </Group>
      {skill.length > 0 && (
        <>
          <div className="section-label" style={{ margin: '8px 0 4px' }}>Reasoning &amp; coding ladders</div>
          <Group gap={6} mb="md">
            {skill.map((l) => {
              const p = ladderProgress(state, l);
              return (
                <Button key={l.id} small variant={l.id === ladder.id ? 'primary' : 'default'} onClick={() => selectLadder(l.id)}>
                  {l.title} · {p.done}/{p.total}
                </Button>
              );
            })}
          </Group>
        </>
      )}

      <Card>
        <Group gap={6} mb="xs">
          <Tag color="geekblue">{ladder.title}</Tag>
          {ladder.module ? <Tag color="grey">Module {ladder.module.toUpperCase()}</Tag> : <Tag color="geekblue">Reasoning &amp; coding</Tag>}
          <Tag color={bossReady(state, ladder) ? 'green' : 'grey'}>{bossReady(state, ladder) ? 'Final boss unlocked' : 'Final boss locked'}</Tag>
        </Group>
        <p className="page-sub" style={{ margin: '0 0 12px' }}>{ladder.blurb}</p>
        <ProgressBar value={pr.done} total={pr.total} />
        <Group gap="sm" mt="md" align="center">
          <Button variant="primary" onClick={() => focusProblem(hereId, ladder.id)}>{pr.done ? 'Continue ladder →' : 'Start ladder →'}</Button>
          <Text size="sm" c="dimmed">
            Next: <Text span fw={600} c="bright">{getProblem(hereId)?.title}</Text>
          </Text>
        </Group>
      </Card>

      <div className="section-label" style={{ marginTop: 18 }}>The path — {ladder.problemIds.length} rungs</div>
      <p className="page-sub" style={{ margin: '-2px 0 12px' }}>Tap any rung to open it in Focus Mode.</p>
      <Stack gap={8}>
        {ladder.problemIds.map((pid, i) => {
          const p = getProblem(pid)!;
          const st = problemStatus(state, pid);
          const here = pid === hereId && st !== 'completed';
          const ring = st === 'completed' ? RING_COLOR.completed : st === 'review' ? RING_COLOR.review : here ? RING_COLOR.here : RING_COLOR.todo;
          return (
            <UnstyledButton
              key={pid}
              className={here ? 'gym-rung gym-rung-here' : 'gym-rung'}
              onClick={() => focusProblem(pid, ladder.id)}
            >
              <ThemeIcon variant="outline" radius="xl" size={30} color={ring}>
                <Text size="xs" fw={700}>{st === 'completed' ? '✓' : i + 1}</Text>
              </ThemeIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Group gap={6} wrap="nowrap">
                  <Text fw={600} size="sm" lineClamp={1}>{p.title}</Text>
                  {here && <Badge size="xs" color="indigo" variant="light" styles={{ label: { textTransform: 'none' } }}>you are here</Badge>}
                </Group>
                <Text size="xs" c="dimmed">{p.stage}</Text>
              </div>
              <Group gap={6} wrap="nowrap" style={{ flex: '0 0 auto' }}>
                <Tag color={DIFFICULTY_META[p.difficulty].color}>{DIFFICULTY_META[p.difficulty].label}</Tag>
                {p.timed && <Tag color="volcano">⏱</Tag>}
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    </div>
  );
}
