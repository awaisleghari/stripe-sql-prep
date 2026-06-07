import { useState } from 'react';
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
      <div className="pill-row" style={{ marginBottom: 14 }}>
        <Button small variant="primary" onClick={() => setRoute('gym')}>Drill these patterns in the Gym →</Button>
      </div>
      <input
        placeholder="Filter… e.g. window, dedup, rolling, join, rate"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, marginBottom: 16, background: 'var(--fill)', color: 'var(--t-1)', fontFamily: 'var(--font)' }}
      />
      <p className="page-sub" style={{ margin: '0 0 10px' }}>{rows.length} of {PYSQL.length} patterns</p>
      {rows.map((r, i) => (
        <Card key={i}>
          <div style={{ fontWeight: 650, fontSize: 14, marginBottom: 10 }}>{r.plain}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>SQL pattern</div>
              <CodeBlock>{r.sql}</CodeBlock>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>Plain Python support</div>
              <CodeBlock>{r.py}</CodeBlock>
            </div>
          </div>
          <div style={{ fontSize: 12.2, color: 'var(--t-2)', marginTop: 10 }}>
            <b style={{ color: 'var(--c-warning)' }}>⚠ common trap:</b> {r.trap}
          </div>
          <div style={{ fontSize: 12.2, color: 'var(--t-2)', marginTop: 5 }}>
            <b style={{ color: 'var(--c-success)' }}>▸ Stripe example:</b> {r.stripe}
          </div>
        </Card>
      ))}
    </div>
  );
}
