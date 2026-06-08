import { Group, SimpleGrid, Table, Title, Text } from '@mantine/core';
import { MOCKS } from '@/data/mock';
import { RUBRICS } from '@/data/rubrics';
import { useProgress, setMockScore, setRoute } from '@/state/progressStore';
import type { Rubric } from '@/types';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Collapse } from '@/components/ui/Collapse';
import { CodeBlock } from '@/components/ui/CodeBlock';

const RUBRIC_BY_ID: Record<string, Rubric> = Object.fromEntries(RUBRICS.map((r) => [r.id, r]));
const UPCOMING = [
  { t: 'Mock 2 · Realistic medium', time: '75 min' },
  { t: 'Mock 3 · Hard Stripe', time: '90 min' },
  { t: 'Mock 4 · Final boss', time: '3 hours' },
];

export function MockView() {
  const state = useProgress();
  const mock = MOCKS[0];

  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Timed, end-to-end simulations scored against the same rubric a Stripe-style interviewer would use. Work each component
        as if live — talk aloud, state assumptions, define metric, grain and denominator before writing — then self-score.
      </p>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="md">
        <Card>
          <Tag color="green">Live</Tag>
          <Text fw={650} fz="sm" mt={6}>{mock.title}</Text>
          <Text className="page-sub">{mock.time}</Text>
        </Card>
        {UPCOMING.map((mk) => (
          <Card key={mk.t}>
            <Tag color="grey">Expansion</Tag>
            <Text fw={650} fz="sm" mt={6}>{mk.t}</Text>
            <Text className="page-sub">{mk.time}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Title order={2} fz={17} mb={4}>{mock.title} — {mock.time}</Title>
      <p className="page-sub" style={{ marginTop: 0 }}>{mock.blurb}</p>
      <Callout variant="interview" title="▸ How to run this like a real interview">
        Set a {mock.time} timer. For each component: restate the question, ask clarifying questions, define the metric, grain
        and denominator out loud, then build. Keep narrating — interviewers score the talk track as much as the SQL. Open the
        reference framework only after you commit to an answer.
      </Callout>

      {mock.components.map((c, i) => {
        const rb = RUBRIC_BY_ID[c.rubric];
        const key = `m1_${i}`;
        const scores = state.mock[key] ?? {};
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        return (
          <Card key={i}>
            <Group gap={6} mb="xs">
              <Tag color="grey">Component {i + 1}</Tag>
              <Tag color="geekblue">{c.kind}</Tag>
              <Tag color="grey">rubric: {rb.name} (/{rb.max})</Tag>
            </Group>
            <div className="prose" style={{ fontSize: 14 }}>{c.prompt}</div>
            {c.guidance && <p className="page-sub" style={{ marginTop: 8 }}>{c.guidance}</p>}
            <Collapse title="✅ Reference solution / framework — reveal after you commit">
              <CodeBlock>{c.solution}</CodeBlock>
              {c.notes && <ul className="prose" style={{ marginTop: 8 }}>{c.notes.map((n, j) => <li key={j}>{n}</li>)}</ul>}
            </Collapse>
            <Collapse title={`📋 ${rb.name} rubric — self-score (${total}/${rb.max})`}>
              <Table fz="xs" verticalSpacing={6} withRowBorders>
                <Table.Tbody>
                  {rb.criteria.map((cr, ci) => (
                    <Table.Tr key={ci}>
                      <Table.Td style={{ fontWeight: 600, width: '30%' }}>{cr.c}</Table.Td>
                      <Table.Td c="dimmed">{cr.two}</Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          {[0, 1, 2].map((n) => (
                            <Button key={n} small variant={scores[ci] === n ? 'primary' : 'default'} onClick={() => setMockScore(key, ci, n)}>{n}</Button>
                          ))}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Text fw={600} mt="xs">Total: {total} / {rb.max}</Text>
            </Collapse>
          </Card>
        );
      })}

      <Callout variant="tip" title="Debrief checklist — after you finish">
        Did you state assumptions and the metric definition before coding? Name the grain and denominator for every metric?
        Handle NULLs, duplicates, fan-out and late-arriving data? Validate the result? Could you explain every query aloud in
        two sentences?
      </Callout>
      <Group mt="md">
        <Button variant="primary" onClick={() => setRoute('panic')}>Review the Panic Sheet →</Button>
      </Group>
    </div>
  );
}
