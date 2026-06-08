import { Group, Title } from '@mantine/core';
import { LADDERS, getProblem } from '@/data/gym';
import { useProgress, focusProblem, setGymTab } from '@/state/progressStore';
import { ladderProgress } from '@/state/selectors';
import { ladderOf, nextProblemId, prevProblemId, ladderNextId } from '@/utils/problemNavigation';
import { DIFFICULTY_META, MODE_LABEL } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProblemDetail } from './ProblemDetail';

export function FocusMode() {
  const state = useProgress();
  const fallbackLadder = LADDERS.find((l) => l.id === state.gym.ladder) ?? LADDERS[0];
  const id = state.gym.focus && getProblem(state.gym.focus) ? state.gym.focus! : ladderNextId(fallbackLadder, state);
  const p = getProblem(id);

  if (!p) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 30, opacity: 0.6 }}>🎯</div>
        <div style={{ fontWeight: 650, color: 'var(--t-2)' }}>No problem selected</div>
        <div style={{ marginTop: 12 }}>
          <Button small variant="primary" onClick={() => setGymTab('path')}>Go to Guided Path</Button>
        </div>
      </div>
    );
  }

  const ladder = ladderOf(LADDERS, p.id) ?? fallbackLadder;
  const idx = ladder.problemIds.indexOf(p.id);
  const prev = prevProblemId(ladder, p.id);
  const next = nextProblemId(ladder, p.id);
  const pr = ladderProgress(state, ladder);

  return (
    <div>
      <div className="focus-head">
        <Group gap={6} mb="xs">
          <Tag color="geekblue">{ladder.title}</Tag>
          <Tag color="grey">Problem {idx + 1} of {ladder.problemIds.length}</Tag>
          <Tag color={DIFFICULTY_META[p.difficulty].color}>{DIFFICULTY_META[p.difficulty].label}</Tag>
          {p.mode !== 'SQL' && <Tag color="grey">{MODE_LABEL[p.mode]}</Tag>}
          <Tag color={p.timed ? 'volcano' : 'grey'}>{p.timed ? `⏱ ${p.est}` : p.est}</Tag>
        </Group>
        <Title order={3} className="focus-title">{p.title}</Title>
        <div style={{ margin: '10px 0 2px' }}>
          <ProgressBar value={pr.done} total={pr.total} />
        </div>
        <Group gap="sm" mt="sm">
          {prev && <Button small onClick={() => focusProblem(prev, ladder.id)}>← Previous</Button>}
          {next && <Button small variant="primary" onClick={() => focusProblem(next, ladder.id)}>Next problem →</Button>}
          <Button small onClick={() => setGymTab('path')}>↩ Ladder overview</Button>
        </Group>
      </div>

      <Card>
        <ProblemDetail problem={p} />
      </Card>

      <Group gap="sm" mt="md">
        {prev && <Button onClick={() => focusProblem(prev, ladder.id)}>← Previous</Button>}
        {next ? (
          <Button variant="primary" onClick={() => focusProblem(next, ladder.id)}>Next problem →</Button>
        ) : (
          <Button variant="primary" onClick={() => setGymTab('path')}>Finish — back to ladder →</Button>
        )}
        <Button onClick={() => setGymTab('browse')}>Browse all</Button>
      </Group>
    </div>
  );
}
