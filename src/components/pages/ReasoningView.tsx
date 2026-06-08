import { useState } from 'react';
import { Group, SimpleGrid, TextInput, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { PYSQL } from '@/data/pysql';
import { setRoute } from '@/state/progressStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CodeBlock } from '@/components/ui/CodeBlock';

export function ReasoningView() {
  const [q, setQ] = useState('');
  const rows = PYSQL.filter((r) => (r.plain + r.sql + r.py + r.trap + r.stripe).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        A lookup table from a plain-English data question to the SQL pattern that answers it. The Python column is optional
        support; the <b>SQL pattern</b> and the <b>common trap</b> are what matter in an interview.
      </p>
      <Group mb="md">
        <Button small variant="primary" onClick={() => setRoute('gym')}>Drill these patterns in the Gym →</Button>
      </Group>
      <TextInput
        placeholder="Filter… e.g. window, dedup, rolling, join, rate"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        mb="md"
      />
      <p className="page-sub" style={{ margin: '0 0 10px' }}>{rows.length} of {PYSQL.length} patterns</p>
      {rows.map((r, i) => (
        <Card key={i}>
          <Text fw={650} mb={10}>{r.plain}</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>SQL pattern</div>
              <CodeBlock>{r.sql}</CodeBlock>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>Plain Python support</div>
              <CodeBlock>{r.py}</CodeBlock>
            </div>
          </SimpleGrid>
          <Text size="xs" c="dimmed" mt="sm">
            <Text span fw={700} c="yellow">⚠ common trap:</Text> {r.trap}
          </Text>
          <Text size="xs" c="dimmed" mt={5}>
            <Text span fw={700} c="teal">▸ Stripe example:</Text> {r.stripe}
          </Text>
        </Card>
      ))}
    </div>
  );
}
