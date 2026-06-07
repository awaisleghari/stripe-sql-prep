import { MODULES } from '@/data/modules';
import { LADDERS, PROBLEMS, getProblem } from '@/data/gym';
import { useProgress, focusProblem, openModule, setRoute } from '@/state/progressStore';
import { gymCounts } from '@/state/selectors';
import { readiness } from '@/utils/scoring';
import { recommendedProblemId, ladderOf } from '@/utils/problemNavigation';
import { DIFFICULTY_META } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function Dashboard() {
  const state = useProgress();
  const score = readiness(state, MODULES);
  const counts = gymCounts(state, PROBLEMS);
  const recId = recommendedProblemId(LADDERS, state);
  const rec = getProblem(recId);
  const recLadder = rec ? ladderOf(LADDERS, rec.id) : undefined;

  return (
    <div>
      <Card>
        <div className="section-label">Stripe interview readiness</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '6px 0 10px' }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--c-primary)' }}>{score}%</span>
          <span className="page-sub">{counts.completed}/{counts.total} gym problems completed · {MODULES.filter((m) => !m.locked).length} module(s) live</span>
        </div>
        <ProgressBar value={counts.completed} total={counts.total} />
      </Card>

      {rec && (
        <Card>
          <div className="section-label">Recommended next problem</div>
          <div className="pill-row" style={{ margin: '8px 0' }}>
            <strong>{rec.title}</strong>
            <Tag color={DIFFICULTY_META[rec.difficulty].color}>{DIFFICULTY_META[rec.difficulty].label}</Tag>
            {recLadder && <Tag color="geekblue">{recLadder.title}</Tag>}
          </div>
          <Button variant="primary" onClick={() => focusProblem(rec.id, rec.ladder)}>Open in Focus Mode →</Button>
        </Card>
      )}

      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Jump back in</div>
        <div className="pill-row">
          <Button onClick={() => { openModule(MODULES[0].id); }}>📚 Learning path</Button>
          <Button onClick={() => setRoute('gym')}>🏋️ Practice Gym</Button>
          <Button onClick={() => setRoute('schema')}>🗄 Schema explorer</Button>
        </div>
      </Card>
    </div>
  );
}
