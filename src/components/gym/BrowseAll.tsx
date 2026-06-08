import { Group, Select, SimpleGrid, Paper, Text } from '@mantine/core';
import { LADDERS, PROBLEMS } from '@/data/gym';
import { useProgress, focusProblem, setFilters } from '@/state/progressStore';
import { problemStatus } from '@/state/selectors';
import { filterMatch } from '@/utils/filters';
import { whatTrains, ladderOf } from '@/utils/problemNavigation';
import { DIFFICULTY_META, MODE_LABEL, MODE_ORDER } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import type { Mode, TagColor } from '@/types';

function StatusTag({ id }: { id: string }) {
  const state = useProgress();
  const s = problemStatus(state, id);
  const map: Record<typeof s, [TagColor, string]> = {
    notstarted: ['grey', 'Not started'],
    attempted: ['blue', 'Attempted'],
    completed: ['green', '✓ Done'],
    review: ['volcano', '🚩 Review'],
  };
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
      <Paper withBorder p="md" radius="md">
        <Group gap="md" align="flex-end">
          <Select
            label="Implementation mode"
            placeholder="All"
            clearable
            value={f.mode ?? null}
            onChange={(v) => setFilters({ ...f, mode: (v || undefined) as Mode | undefined })}
            data={presentModes.map((m) => ({ value: m, label: MODE_LABEL[m] }))}
            w={220}
          />
          <Select
            label="Ladder"
            placeholder="All"
            clearable
            value={f.ladder ?? null}
            onChange={(v) => setFilters({ ...f, ladder: v || undefined })}
            data={LADDERS.map((l) => ({ value: l.id, label: l.title }))}
            w={240}
          />
          <Button onClick={() => setFilters({})}>Clear filters</Button>
        </Group>
      </Paper>

      <p className="page-sub" style={{ margin: '12px 0 10px' }}>
        {list.length} problem{list.length === 1 ? '' : 's'} match — tap a card to open it in Focus Mode
      </p>
      {list.length === 0 ? (
        <div className="empty-state">No problems match these filters.</div>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {list.map((p) => {
            const lad = ladderOf(LADDERS, p.id);
            return (
              <Paper key={p.id} withBorder p="md" radius="md" className="browse-card" onClick={() => focusProblem(p.id, p.ladder)}>
                <Group justify="space-between" gap="xs" wrap="nowrap" align="flex-start">
                  <Text fw={600} size="sm" lineClamp={2}>{p.title}</Text>
                  <StatusTag id={p.id} />
                </Group>
                <Group gap={6} my="xs">
                  {lad && <Tag color="geekblue">{lad.title}</Tag>}
                  <Tag color={DIFFICULTY_META[p.difficulty].color}>{DIFFICULTY_META[p.difficulty].label}</Tag>
                  <Tag color="grey">{p.est}</Tag>
                </Group>
                <Text size="xs" c="dimmed">{whatTrains(p)}</Text>
                <Button
                  small
                  variant="primary"
                  style={{ marginTop: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusProblem(p.id, p.ladder);
                  }}
                >
                  Open in Focus Mode →
                </Button>
              </Paper>
            );
          })}
        </SimpleGrid>
      )}
    </div>
  );
}
