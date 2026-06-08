import { Badge } from '@mantine/core';
import type { TagColor } from '@/types';

/** Maps the app's TagColor palette onto Mantine theme colors. */
const COLOR: Record<TagColor, string> = {
  blue: 'brand',
  geekblue: 'indigo',
  gold: 'yellow',
  green: 'teal',
  grey: 'gray',
  red: 'red',
  volcano: 'orange',
};

export function Tag({ color = 'grey', children }: { color?: TagColor; children: React.ReactNode }) {
  return (
    <Badge variant="light" color={COLOR[color]} radius="sm" fw={600} styles={{ label: { textTransform: 'none' } }}>
      {children}
    </Badge>
  );
}
