import { PROBLEMS } from '@/data/gym';
import { useProgress, setGymTab } from '@/state/progressStore';
import { gymCounts, problemStatus } from '@/state/selectors';
import type { GymTab } from '@/types';
import { Tag } from '@/components/ui/Tag';
import { GuidedPath } from './GuidedPath';
import { FocusMode } from './FocusMode';
import { BrowseAll } from './BrowseAll';
import { ReviewQueue } from './ReviewQueue';

const TABS: { id: GymTab; label: string }[] = [
  { id: 'path', label: '🧭 Guided Path' },
  { id: 'focus', label: '🎯 Focus Mode' },
  { id: 'browse', label: '🔎 Browse all' },
  { id: 'review', label: '🚩 Review queue' },
];

export function GymView() {
  const state = useProgress();
  const counts = gymCounts(state, PROBLEMS);
  const reviewN = PROBLEMS.filter((p) => problemStatus(state, p.id) === 'review').length;

  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        A focused, one-problem-at-a-time runner of original Stripe-flavoured drills. Pick a ladder in Guided Path and press Start
        to drop into Focus Mode.
      </p>
      <div className="pill-row" style={{ margin: '6px 0 14px' }}>
        <Tag color="green">{counts.completed} / {counts.total} completed</Tag>
        <Tag color="blue">{counts.attempted} attempted</Tag>
        {counts.review > 0 && <Tag color="volcano">{counts.review} flagged</Tag>}
      </div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <div key={t.id} className={`tab ${state.gym.tab === t.id ? 'active' : ''}`} onClick={() => setGymTab(t.id)}>
            {t.label}{t.id === 'review' && reviewN ? ` (${reviewN})` : ''}
          </div>
        ))}
      </div>
      {state.gym.tab === 'focus' ? <FocusMode /> : state.gym.tab === 'browse' ? <BrowseAll /> : state.gym.tab === 'review' ? <ReviewQueue /> : <GuidedPath />}
    </div>
  );
}
