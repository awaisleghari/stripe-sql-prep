import { LADDERS, PROBLEMS } from '@/data/gym';
import { useProgress, focusProblem, setFilters } from '@/state/progressStore';
import { problemStatus } from '@/state/selectors';
import { filterMatch } from '@/utils/filters';
import { whatTrains, ladderOf } from '@/utils/problemNavigation';
import { DIFFICULTY_META, MODE_LABEL, MODE_ORDER } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Mode } from '@/types';

function StatusTag({ id }: { id: string }) {
  const state = useProgress();
  const s = problemStatus(state, id);
  const map = { notstarted: ['grey', 'Not started'], attempted: ['blue', 'Attempted'], completed: ['green', '✓ Done'], review: ['volcano', '🚩 Review'] } as const;
  const [c, t] = map[s];
  return <Tag color={c}>{t}</Tag>;
}

export function BrowseAll() {
  const state = useProgress();
  const f = state.gym.filters;
  const list = PROBLEMS.filter((p) => filterMatch(p, f, state));
  const presentModes = [...new Set(PROBLEMS.map((p) => p.mode))].sort((a, b) => MODE_ORDER.indexOf(a) - MODE_ORDER.indexOf(b));

  return (
    <div>
      <Card>
        <div className="pill-row" style={{ gap: 12 }}>
          <label className="section-label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Implementation mode
            <select
              value={f.mode ?? ''}
              onChange={(e) => setFilters({ ...f, mode: (e.target.value || undefined) as Mode | undefined })}
              style={{ padding: '7px 10px', background: 'var(--fill)', color: 'var(--t-1)', border: '1px solid var(--border)', borderRadius: 7 }}
            >
              <option value="">All</option>
              {presentModes.map((m) => (
                <option key={m} value={m}>{MODE_LABEL[m]}</option>
              ))}
            </select>
          </label>
          <label className="section-label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Ladder
            <select
              value={f.ladder ?? ''}
              onChange={(e) => setFilters({ ...f, ladder: e.target.value || undefined })}
              style={{ padding: '7px 10px', background: 'var(--fill)', color: 'var(--t-1)', border: '1px solid var(--border)', borderRadius: 7 }}
            >
              <option value="">All</option>
              {LADDERS.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </label>
          <Button small onClick={() => setFilters({})} style={{ alignSelf: 'flex-end' }}>Clear filters</Button>
        </div>
      </Card>

      <p className="page-sub" style={{ margin: '12px 0 10px' }}>
        {list.length} problem{list.length === 1 ? '' : 's'} match — tap a card to open it in Focus Mode
      </p>
      {list.length === 0 ? (
        <div className="empty-state">No problems match these filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(258px,1fr))', gap: 12 }}>
          {list.map((p) => {
            const lad = ladderOf(LADDERS, p.id);
            return (
              <div key={p.id} className="card" style={{ padding: '14px 15px', cursor: 'pointer' }} onClick={() => focusProblem(p.id, p.ladder)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{ fontSize: 14 }}>{p.title}</strong>
                  <StatusTag id={p.id} />
                </div>
                <div className="pill-row" style={{ margin: '7px 0 8px' }}>
                  {lad && <Tag color="geekblue">{lad.title}</Tag>}
                  <Tag color={DIFFICULTY_META[p.difficulty].color}>{DIFFICULTY_META[p.difficulty].label}</Tag>
                  <Tag color="grey">{p.est}</Tag>
                </div>
                <div style={{ fontSize: 12.3, color: 'var(--t-2)' }}>{whatTrains(p)}</div>
                <div style={{ marginTop: 10 }}>
                  <Button small variant="primary" onClick={(e) => { e.stopPropagation(); focusProblem(p.id, p.ladder); }}>Open in Focus Mode →</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
