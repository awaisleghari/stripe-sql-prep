import { PROBLEMS } from '@/data/gym';
import { useProgress, focusProblem } from '@/state/progressStore';
import { problemStatus } from '@/state/selectors';
import { Button } from '@/components/ui/Button';

export function ReviewQueue() {
  const state = useProgress();
  const list = PROBLEMS.filter((p) => problemStatus(state, p.id) === 'review');
  return (
    <div>
      <div className="section-label">Needs review</div>
      <p className="page-sub" style={{ margin: '-2px 0 12px' }}>Problems you flagged to revisit. Clear this before your mocks.</p>
      {list.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 30, opacity: 0.6 }}>✅</div>
          Nothing flagged for review. Mark a problem <b>Needs review</b> in Focus Mode and it collects here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(258px,1fr))', gap: 12 }}>
          {list.map((p) => (
            <div key={p.id} className="card" style={{ padding: '14px 15px', cursor: 'pointer' }} onClick={() => focusProblem(p.id, p.ladder)}>
              <strong style={{ fontSize: 14 }}>{p.title}</strong>
              <div style={{ marginTop: 10 }}>
                <Button small variant="primary" onClick={(e) => { e.stopPropagation(); focusProblem(p.id, p.ladder); }}>Reopen →</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
