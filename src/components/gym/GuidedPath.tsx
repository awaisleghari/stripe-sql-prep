import { LADDERS } from '@/data/gym';
import { getProblem } from '@/data/gym';
import { useProgress, selectLadder, focusProblem } from '@/state/progressStore';
import { ladderProgress, problemStatus, bossReady } from '@/state/selectors';
import { ladderNextId } from '@/utils/problemNavigation';
import { DIFFICULTY_META } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
      <div className="section-label" style={{ margin: '6px 0' }}>SQL ladders</div>
      <div className="pill-row" style={{ marginBottom: 10 }}>
        {sql.map((l) => {
          const p = ladderProgress(state, l);
          return (
            <Button key={l.id} small variant={l.id === ladder.id ? 'primary' : 'default'} onClick={() => selectLadder(l.id)}>
              {l.title} · {p.done}/{p.total}
            </Button>
          );
        })}
      </div>
      {skill.length > 0 && (
        <>
          <div className="section-label" style={{ margin: '6px 0' }}>Reasoning &amp; coding ladders</div>
          <div className="pill-row" style={{ marginBottom: 14 }}>
            {skill.map((l) => {
              const p = ladderProgress(state, l);
              return (
                <Button key={l.id} small variant={l.id === ladder.id ? 'primary' : 'default'} onClick={() => selectLadder(l.id)}>
                  {l.title} · {p.done}/{p.total}
                </Button>
              );
            })}
          </div>
        </>
      )}

      <Card>
        <div className="pill-row" style={{ marginBottom: 8 }}>
          <Tag color="geekblue">{ladder.title}</Tag>
          {ladder.module ? <Tag color="grey">Module {ladder.module.toUpperCase()}</Tag> : <Tag color="geekblue">Reasoning &amp; coding</Tag>}
          <Tag color={bossReady(state, ladder) ? 'green' : 'grey'}>{bossReady(state, ladder) ? 'Final boss unlocked' : 'Final boss locked'}</Tag>
        </div>
        <p className="page-sub" style={{ margin: '0 0 12px' }}>{ladder.blurb}</p>
        <ProgressBar value={pr.done} total={pr.total} />
        <div className="pill-row" style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={() => focusProblem(hereId, ladder.id)}>{pr.done ? 'Continue ladder →' : 'Start ladder →'}</Button>
          <span style={{ fontSize: 12.5, color: 'var(--t-2)', alignSelf: 'center' }}>
            Next: <b style={{ color: 'var(--t-1)' }}>{getProblem(hereId)?.title}</b>
          </span>
        </div>
      </Card>

      <div className="section-label" style={{ marginTop: 18 }}>The path — {ladder.problemIds.length} rungs</div>
      <p className="page-sub" style={{ margin: '-2px 0 12px' }}>Tap any rung to open it in Focus Mode.</p>
      {ladder.problemIds.map((pid, i) => {
        const p = getProblem(pid)!;
        const st = problemStatus(state, pid);
        const here = pid === hereId && st !== 'completed';
        const col = st === 'completed' ? 'var(--c-success)' : st === 'review' ? 'var(--c-warning)' : here ? 'var(--c-primary)' : 'var(--border)';
        return (
          <div key={pid} className={`rung ${here ? 'rung-here' : ''}`} onClick={() => focusProblem(pid, ladder.id)}>
            <div className="rung-num" style={{ borderColor: col, color: st === 'completed' ? 'var(--c-success)' : 'var(--t-2)' }}>
              {st === 'completed' ? '✓' : i + 1}
            </div>
            <div className="rung-title">
              {p.title}
              {here && <span className="tag geekblue" style={{ marginLeft: 6 }}>◉ you are here</span>}
              <div className="rung-sub">{p.stage}</div>
            </div>
            <div className="pill-row" style={{ flex: '0 0 auto' }}>
              <Tag color={DIFFICULTY_META[p.difficulty].color}>{DIFFICULTY_META[p.difficulty].label}</Tag>
              {p.timed && <Tag color="volcano">⏱</Tag>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
