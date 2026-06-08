import { Group, Title } from '@mantine/core';
import { PANIC } from '@/data/panic';
import { setRoute } from '@/state/progressStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CodeBlock } from '@/components/ui/CodeBlock';

export function PanicSheet() {
  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Your one-screen reference for the final hour. Read this the morning of — <b>do not cram new material</b>. Reinforce
        the reasoning loop, the top patterns, the classic traps, and the phrases that signal senior judgment.
      </p>
      <Group mb="md">
        <Button small variant="primary" onClick={() => setRoute('mock')}>Do one final mock →</Button>
      </Group>
      {PANIC.map((s, i) => (
        <Card key={i}>
          <Title order={3} fz={15} mb={10}>{s.h}</Title>
          {s.code && <CodeBlock>{s.code}</CodeBlock>}
          {s.items && (
            <ul className="prose" style={{ margin: 0 }}>
              {s.items.map((x, j) => <li key={j}>{x}</li>)}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}
