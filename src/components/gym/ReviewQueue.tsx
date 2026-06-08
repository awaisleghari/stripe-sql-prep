import { SimpleGrid, Paper, Text } from '@mantine/core';
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {list.map((p) => (
            <Paper key={p.id} withBorder p="md" radius="md" className="browse-card" onClick={() => focusProblem(p.id, p.ladder)}>
              <Text fw={600} size="sm" lineClamp={2}>{p.title}</Text>
              <Button
                small
                variant="primary"
                style={{ marginTop: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  focusProblem(p.id, p.ladder);
                }}
              >
                Reopen →
              </Button>
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
