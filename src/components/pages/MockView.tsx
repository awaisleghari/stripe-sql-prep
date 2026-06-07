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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 18 }}>
        <Card>
          <Tag color="green">Live</Tag>
          <div style={{ fontWeight: 650, fontSize: 14, marginTop: 6 }}>{mock.title}</div>
          <div className="page-sub">{mock.time}</div>
        </Card>
        {UPCOMING.map((mk) => (
          <Card key={mk.t}>
            <Tag color="grey">Expansion</Tag>
            <div style={{ fontWeight: 650, fontSize: 14, marginTop: 6 }}>{mk.t}</div>
            <div className="page-sub">{mk.time}</div>
          </Card>
        ))}
      </div>

      <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>{mock.title} — {mock.time}</h2>
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
            <div className="pill-row" style={{ marginBottom: 8 }}>
              <Tag color="grey">Component {i + 1}</Tag>
              <Tag color="geekblue">{c.kind}</Tag>
              <Tag color="grey">rubric: {rb.name} (/{rb.max})</Tag>
            </div>
            <div className="prose" style={{ fontSize: 13.5 }}>{c.prompt}</div>
            {c.guidance && <p className="page-sub" style={{ marginTop: 8 }}>{c.guidance}</p>}
            <Collapse title="✅ Reference solution / framework — reveal after you commit">
              <CodeBlock>{c.solution}</CodeBlock>
              {c.notes && <ul className="prose" style={{ marginTop: 8 }}>{c.notes.map((n, j) => <li key={j}>{n}</li>)}</ul>}
            </Collapse>
            <Collapse title={`📋 ${rb.name} rubric — self-score (${total}/${rb.max})`}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <tbody>
                  {rb.criteria.map((cr, ci) => (
                    <tr key={ci} style={{ borderTop: '1px solid var(--split)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600, width: '30%' }}>{cr.c}</td>
                      <td style={{ padding: '6px 8px', color: 'var(--t-2)' }}>{cr.two}</td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {[0, 1, 2].map((n) => (
                          <Button key={n} small variant={scores[ci] === n ? 'primary' : 'default'} onClick={() => setMockScore(key, ci, n)} style={{ marginLeft: 4 }}>{n}</Button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 8, fontWeight: 600 }}>Total: {total} / {rb.max}</div>
            </Collapse>
          </Card>
        );
      })}

      <Callout variant="tip" title="Debrief checklist — after you finish">
        Did you state assumptions and the metric definition before coding? Name the grain and denominator for every metric?
        Handle NULLs, duplicates, fan-out and late-arriving data? Validate the result? Could you explain every query aloud in
        two sentences?
      </Callout>
      <div className="pill-row" style={{ marginTop: 14 }}>
        <Button variant="primary" onClick={() => setRoute('panic')}>Review the Panic Sheet →</Button>
      </div>
    </div>
  );
}
