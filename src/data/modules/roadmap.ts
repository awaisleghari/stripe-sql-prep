/**
 * The full learning-path curriculum (m0–m16), grouped by day.
 *
 * Built modules (`locked: false`) have real content in src/data/modules and are
 * navigable. Locked slots are "coming soon" placeholders — they have no content yet
 * but must still appear in the rail so the numbering is complete and the roadmap is
 * honest about scope. Titles for locked slots are carried here (no Module object exists).
 */

export type RoadmapSlot = { id: string; locked: boolean; lockedTitle?: string };
export type RoadmapDay = { day: string; theme: string; slots: RoadmapSlot[] };

export const MODULE_ROADMAP: RoadmapDay[] = [
  {
    day: 'Day 1',
    theme: 'Foundations',
    slots: [
      { id: 'm0', locked: false },
      { id: 'm1', locked: false },
      { id: 'm2', locked: false },
    ],
  },
  {
    day: 'Day 2',
    theme: 'Logic & Joins',
    slots: [
      { id: 'm3', locked: false },
      { id: 'm4', locked: false },
    ],
  },
  {
    day: 'Day 3',
    theme: 'Composition & Windows',
    slots: [
      { id: 'm5', locked: false },
      { id: 'm6', locked: false },
    ],
  },
  {
    day: 'Day 4',
    theme: 'Time & Patterns',
    slots: [
      { id: 'm7', locked: false },
      { id: 'm8', locked: false },
      { id: 'm9', locked: false },
    ],
  },
  {
    day: 'Day 5',
    theme: 'Stripe Metrics',
    slots: [
      { id: 'm10', locked: true, lockedTitle: 'Retention & Cohort Analysis' },
      { id: 'm11', locked: false },
      { id: 'm12', locked: false },
      { id: 'm13', locked: true, lockedTitle: 'Failed-Payment Recovery' },
    ],
  },
  {
    day: 'Day 6',
    theme: 'Advanced & Interview',
    slots: [
      { id: 'm14', locked: true, lockedTitle: 'Anomaly Detection' },
      { id: 'm15', locked: true, lockedTitle: 'Experimentation & A/B Testing' },
      { id: 'm16', locked: true, lockedTitle: 'Mock Interview Mode' },
    ],
  },
];
