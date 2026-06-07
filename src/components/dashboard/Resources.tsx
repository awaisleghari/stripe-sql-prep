import { RESOURCES, RESOURCE_MAP } from '@/data/resources';
import { PROBLEMS } from '@/data/gym';
import { useProgress, setFilters, setGymTab, setRoute } from '@/state/progressStore';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

export function Resources() {
  useProgress();
  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Secondary by design — the Practice Gym already adapts these patterns into Stripe-flavoured drills. Do the internal problems first.
      </p>
      {RESOURCES.map((r) => {
        const map = RESOURCE_MAP[r.name];
        const n = map?.mode ? PROBLEMS.filter((p) => p.mode === map.mode).length : map?.source ? PROBLEMS.filter((p) => p.source === map.source).length : 0;
        return (
          <Card key={r.name}>
            <div className="pill-row" style={{ marginBottom: 6 }}>
              <Tag color="blue">{r.day}</Tag>
              {map && <Tag color="geekblue">{map.label}</Tag>}
            </div>
            <div style={{ fontWeight: 650 }}><a href={r.url} target="_blank" rel="noopener">{r.name} ↗</a></div>
            <p className="page-sub" style={{ marginBottom: 8 }}>{r.use}</p>
            {map && (
              <Button small variant="primary" onClick={() => {
                if (map.mode) setFilters({ mode: map.mode });
                else if (map.source) setFilters({ source: map.source });
                setGymTab('browse');
                setRoute('gym');
              }}>
                Open {n} matching problem{n === 1 ? '' : 's'} in the Gym →
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
