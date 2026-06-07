import type { Problem } from '@/types';
import { useProgress, setProblemStatus } from '@/state/progressStore';
import { problemStatus } from '@/state/selectors';
import { MODE_LABEL } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Collapse } from '@/components/ui/Collapse';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Labeled } from '@/components/ui/Labeled';

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
      {items.map((x, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: x }} />
      ))}
    </ul>
  );
}

/** Renders the full guided structure for one problem. Used by Focus Mode. */
export function ProblemDetail({ problem: p }: { problem: Problem }) {
  const state = useProgress();
  const status = problemStatus(state, p.id);
  const isSql = p.mode === 'SQL';

  return (
    <div>
      <Callout variant="tip" title="🎯 What you need to do">
        <span dangerouslySetInnerHTML={{ __html: p.task ?? p.business }} />
      </Callout>

      {p.deliverable && <Labeled label="📦 Expected deliverable"><span dangerouslySetInnerHTML={{ __html: p.deliverable }} /></Labeled>}
      {(p.why ?? '') && <Labeled label="💡 Why this matters for Stripe"><span dangerouslySetInnerHTML={{ __html: p.why! }} /></Labeled>}
      {p.before && <Labeled label="☑️ Before you start, identify"><List items={p.before} /></Labeled>}
      {p.howto && <Collapse title="🧭 How to attempt this problem"><List items={p.howto} /></Collapse>}

      {p.schema?.length ? (
        <Labeled label="🗄 Schema in play — tables you need"><span className="mono">{p.schema.join(', ')}</span></Labeled>
      ) : p.inputSpec ? (
        <Labeled label="📥 Input in play"><span dangerouslySetInnerHTML={{ __html: p.inputSpec }} /></Labeled>
      ) : p.context ? (
        <Labeled label="🧩 Context in play"><span dangerouslySetInnerHTML={{ __html: p.context }} /></Labeled>
      ) : null}

      <div className="lblk" style={{ borderLeftColor: 'var(--c-primary)' }}>
        <div className="lbl">▸ Your task</div>
        <div dangerouslySetInnerHTML={{ __html: p.prompt }} />
        {p.signature && <CodeBlock>{p.signature}</CodeBlock>}
      </div>

      {p.broken && <Labeled label={`🛠 Broken ${isSql ? 'query' : 'code'} to diagnose`}><CodeBlock>{p.broken}</CodeBlock></Labeled>}
      {p.confusion && <Callout variant="confusion" title="⚠ Common confusion"><span dangerouslySetInnerHTML={{ __html: p.confusion }} /></Callout>}

      <Callout variant="tip" title="✍️ Attempt it first">
        {p.solution ? 'Sketch your solution' : 'Write or say your answer'} before opening the hints below.
      </Callout>

      {p.hints?.length > 0 && (
        <Collapse title="💡 Hints — open one at a time">
          <List items={p.hints} />
        </Collapse>
      )}
      {p.solution ? (
        <Collapse title="✅ Reference solution — reveal after you try">
          <CodeBlock>{p.solution}</CodeBlock>
        </Collapse>
      ) : p.model ? (
        <Collapse title="✅ Model answer — compare after you attempt">
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.model }} />
        </Collapse>
      ) : null}
      {p.tests && <Collapse title="🧪 Tests — run these to check yourself"><CodeBlock>{p.tests}</CodeBlock></Collapse>}
      {p.complexity && (
        <Labeled label="⏱ Complexity to aim for">
          Time: <span className="mono">{p.complexity.time}</span> · Memory: <span className="mono">{p.complexity.memory}</span>
        </Labeled>
      )}
      {p.rubric && <Labeled label="📋 Rubric — a strong answer covers"><List items={p.rubric} /></Labeled>}
      {p.verify && (
        <Collapse title="🔍 Check your work — verification & edge cases">
          <Labeled label={`Expected grain — ${p.verify.grain}`}><span className="mono">{p.verify.columns.join(', ')}</span></Labeled>
          {p.verify.sample && (
            <table style={{ borderCollapse: 'collapse', fontSize: 12, margin: '6px 0' }}>
              <thead><tr>{p.verify.sample.cols.map((c) => (<th key={c} className="mono" style={{ textAlign: 'left', padding: '3px 10px 3px 0', color: 'var(--t-3)' }}>{c}</th>))}</tr></thead>
              <tbody>{p.verify.sample.rows.map((row, ri) => (<tr key={ri}>{row.map((cell, ci) => (<td key={ci} className="mono" style={{ padding: '3px 10px 3px 0', color: 'var(--t-2)' }}>{cell}</td>))}</tr>))}</tbody>
            </table>
          )}
          <Labeled label="Common wrong answers"><List items={p.verify.commonWrong} /></Labeled>
          <Labeled label="Validation"><List items={p.verify.validation} /></Labeled>
          <Labeled label="Edge cases"><List items={p.verify.edgeCases} /></Labeled>
        </Collapse>
      )}

      <Callout variant="interview" title="🎤 Explain aloud"><span dangerouslySetInnerHTML={{ __html: p.explain }} /></Callout>
      {p.teaches && <Labeled label="🎓 What this problem teaches"><span dangerouslySetInnerHTML={{ __html: p.teaches }} /></Labeled>}

      <Labeled label="Track your progress">
        <div className="pill-row">
          <Button small variant={status === 'attempted' ? 'primary' : 'default'} onClick={() => setProblemStatus(p.id, 'attempted')}>Attempted</Button>
          <Button small variant={status === 'completed' ? 'primary' : 'default'} onClick={() => setProblemStatus(p.id, 'completed')}>✓ Completed</Button>
          <Button small variant={status === 'review' ? 'primary' : 'default'} onClick={() => setProblemStatus(p.id, 'review')}>🚩 Needs review</Button>
          <Tag color="grey">Mode: {MODE_LABEL[p.mode]}</Tag>
        </div>
      </Labeled>
    </div>
  );
}
