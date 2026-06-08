import { Progress, Group, Text } from '@mantine/core';

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <Group gap="sm" wrap="nowrap">
      <Progress value={pct} size="md" radius="xl" color="brand" style={{ flex: 1 }} />
      <Text size="xs" c="dimmed" fw={600} style={{ whiteSpace: 'nowrap' }}>
        {value} / {total} done
      </Text>
    </Group>
  );
}
