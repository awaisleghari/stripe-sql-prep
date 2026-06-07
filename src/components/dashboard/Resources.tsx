import { RESOURCES, RESOURCE_MAP } from '@/data/resources';
import { PROBLEMS, LADDERS } from '@/data/gym';
import { useProgress, setFilters, selectLadder, setGymTab, setRoute } from '@/state/progressStore';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

/** Count how many internal problems a resource maps to (by mode, ladder, or source). */
function matchCount(map: (typeof RESOURCE_MAP)[string]): number {
  if (map.mode) return PROBLEMS.filter((p) => p.mode === map.mode).length;
  if (map.ladder) return PROBLEMS.filter((p) => p.ladder === map.ladder).length;
  if (map.source) return PROBLEMS.filter((p) => p.source === map.source).length;
  return 0;
}

export function Resources() {
  useProgress();
  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Secondary by design — the Practice Gym already adapts these patterns into Stripe-flavoured drills. Do the internal
        problems first; reach for a resource for extra reps once you've cleared the matching ladder.
      </p>
      {RESOURCES.map((r) => {
        const map = RESOURCE_MAP[r.name];
        const n = map ? matchCount(map) : 0;
        const label = map?.label ?? (map?.ladder ? LADDERS.find((l) => l.id === map.ladder)?.title : undefined) ?? map?.source?.replace('-style', '');
        return (
          <Card key={r.name}>
            <div className="pill-row" style={{ marginBottom: 6 }}>
              <Tag color="blue">{r.day}</Tag>
              {label && <Tag color="geekblue">{label}</Tag>}
              {map && <Tag color="grey">{n} matching problem{n === 1 ? '' : 's'}</Tag>}
            </div>
            <div style={{ fontWeight: 650 }}>
              <a href={r.url} target="_blank" rel="noopener">{r.name} ↗</a>
            </div>
            <p className="page-sub" style={{ marginBottom: map ? 8 : 0 }}>{r.use}</p>
            {map && n > 0 && (
              <Button
                small
                variant="primary"
                onClick={() => {
                  if (map.ladder) {
                    selectLadder(map.ladder); // Guided Path for that ladder
                  } else {
                    setFilters(map.mode ? { mode: map.mode } : map.source ? { source: map.source } : {});
                    setGymTab('browse');
                  }
                  setRoute('gym');
                }}
              >
                {map.ladder ? 'Open that ladder →' : `Open ${n} matching problem${n === 1 ? '' : 's'} in the Gym →`}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
