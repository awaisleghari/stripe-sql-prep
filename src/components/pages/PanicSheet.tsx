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
      <div className="pill-row" style={{ marginBottom: 14 }}>
        <Button small variant="primary" onClick={() => setRoute('mock')}>Do one final mock →</Button>
      </div>
      {PANIC.map((s, i) => (
        <Card key={i}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>{s.h}</h3>
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
