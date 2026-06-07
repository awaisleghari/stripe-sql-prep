import { LADDERS, PROBLEMS, getProblem } from '@/data/gym';
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
  const id = (state.gym.focus && getProblem(state.gym.focus)) ? state.gym.focus! : ladderNextId(fallbackLadder, state);
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
        <div className="pill-row" style={{ marginBottom: 8 }}>
          <Tag color="geekblue">{ladder.title}</Tag>
          <Tag color="grey">Problem {idx + 1} of {ladder.problemIds.length}</Tag>
          <Tag color={DIFFICULTY_META[p.difficulty].color}>{DIFFICULTY_META[p.difficulty].label}</Tag>
          {p.mode !== 'SQL' && <Tag color="grey">{MODE_LABEL[p.mode]}</Tag>}
          <Tag color={p.timed ? 'volcano' : 'grey'}>{p.timed ? `⏱ ${p.est}` : p.est}</Tag>
        </div>
        <div className="focus-title">{p.title}</div>
        <div style={{ margin: '10px 0 2px' }}><ProgressBar value={pr.done} total={pr.total} /></div>
        <div className="pill-row" style={{ marginTop: 10 }}>
          {prev && <Button small onClick={() => focusProblem(prev, ladder.id)}>← Previous</Button>}
          {next && <Button small variant="primary" onClick={() => focusProblem(next, ladder.id)}>Next problem →</Button>}
          <Button small onClick={() => setGymTab('path')}>↩ Ladder overview</Button>
        </div>
      </div>

      <Card><ProblemDetail problem={p} /></Card>

      <div className="pill-row" style={{ marginTop: 14 }}>
        {prev && <Button onClick={() => focusProblem(prev, ladder.id)}>← Previous</Button>}
        {next ? (
          <Button variant="primary" onClick={() => focusProblem(next, ladder.id)}>Next problem →</Button>
        ) : (
          <Button variant="primary" onClick={() => setGymTab('path')}>Finish — back to ladder →</Button>
        )}
        <Button onClick={() => setGymTab('browse')}>Browse all</Button>
      </div>
    </div>
  );
}

export { PROBLEMS };
