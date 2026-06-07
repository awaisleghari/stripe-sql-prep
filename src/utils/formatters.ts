import type { Difficulty, Priority, Mode, TagColor } from '@/types';

export const TAG_COLORS: readonly TagColor[] = ['blue', 'geekblue', 'gold', 'green', 'grey', 'red', 'volcano'];

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: TagColor }> = {
  recognition: { label: 'Recognition', color: 'grey' },
  easy: { label: 'Easy', color: 'blue' },
  medium: { label: 'Medium', color: 'gold' },
  hard: { label: 'Hard', color: 'volcano' },
  'final-boss': { label: 'Final boss', color: 'red' },
};

export const PRIORITY_META: Record<Priority, { label: string; color: TagColor }> = {
  required: { label: 'Required', color: 'red' },
  should: { label: 'Should-do', color: 'gold' },
  stretch: { label: 'Stretch', color: 'blue' },
  boss: { label: 'Final-boss', color: 'volcano' },
};

export const MODE_LABEL: Record<Mode, string> = {
  SQL: 'SQL',
  Python: 'Python',
  Pseudocode: 'Pseudocode',
  DataLogic: 'Data logic / reasoning',
  Product: 'Product analytics',
  Experiment: 'Experimentation',
  Causal: 'Causal inference',
  Statistics: 'Statistics / MLE',
  Object: 'Stripe object literacy',
  Mixed: 'Mixed',
};

export const MODE_ORDER: Mode[] = ['SQL', 'Python', 'DataLogic', 'Product', 'Experiment', 'Causal', 'Statistics', 'Object', 'Pseudocode', 'Mixed'];

export function modeLabel(mode: Mode | undefined): string {
  return mode ? MODE_LABEL[mode] : MODE_LABEL.SQL;
}
