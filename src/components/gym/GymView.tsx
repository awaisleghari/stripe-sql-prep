import { Tabs, Group, Badge } from '@mantine/core';
import { IconRoute, IconTargetArrow, IconSearch, IconFlag } from '@tabler/icons-react';
import { PROBLEMS } from '@/data/gym';
import { useProgress, setGymTab } from '@/state/progressStore';
import { gymCounts, problemStatus } from '@/state/selectors';
import type { GymTab } from '@/types';
import { Tag } from '@/components/ui/Tag';
import { GuidedPath } from './GuidedPath';
import { FocusMode } from './FocusMode';
import { BrowseAll } from './BrowseAll';
import { ReviewQueue } from './ReviewQueue';

const accent = (hex: string) => ({ ['--accent' as string]: hex } as React.CSSProperties);

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
      <Group gap={6} mb="md">
        <Tag color="green">{counts.completed} / {counts.total} completed</Tag>
        <Tag color="blue">{counts.attempted} attempted</Tag>
        {counts.review > 0 && <Tag color="volcano">{counts.review} flagged</Tag>}
      </Group>

      <Tabs value={state.gym.tab} onChange={(v) => v && setGymTab(v as GymTab)} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="path" color="brand" leftSection={<IconRoute size={15} />}>Guided Path</Tabs.Tab>
          <Tabs.Tab value="focus" color="grape" leftSection={<IconTargetArrow size={15} />}>Focus Mode</Tabs.Tab>
          <Tabs.Tab value="browse" color="cyan" leftSection={<IconSearch size={15} />}>Browse all</Tabs.Tab>
          <Tabs.Tab
            value="review"
            color="orange"
            leftSection={<IconFlag size={15} />}
            rightSection={reviewN ? <Badge size="xs" circle variant="filled" color="orange">{reviewN}</Badge> : null}
          >
            Review queue
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="path" pt="md"><div className="tab-accent" style={accent('#6e8efb')}><GuidedPath /></div></Tabs.Panel>
        <Tabs.Panel value="focus" pt="md"><div className="tab-accent" style={accent('#b692f6')}><FocusMode /></div></Tabs.Panel>
        <Tabs.Panel value="browse" pt="md"><div className="tab-accent" style={accent('#4dc9d6')}><BrowseAll /></div></Tabs.Panel>
        <Tabs.Panel value="review" pt="md"><div className="tab-accent" style={accent('#f0976b')}><ReviewQueue /></div></Tabs.Panel>
      </Tabs>
    </div>
  );
}
