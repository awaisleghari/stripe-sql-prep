import { SCHEMA } from '@/data/schema';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

export function SchemaExplorer() {
  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Synthetic Stripe-style schema. Money is in <b>cents</b>; <span className="mono">balance_transactions</span> is the ledger source of truth for net revenue.
      </p>
      {SCHEMA.map((t) => (
        <Card key={t.name}>
          <div className="pill-row" style={{ marginBottom: 6 }}>
            <strong className="mono" style={{ fontSize: 15 }}>{t.name}</strong>
            <Tag color="grey">{t.grain}</Tag>
          </div>
          {t.whenToUse && <p className="page-sub" style={{ marginTop: 0 }}>{t.whenToUse}</p>}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <tbody>
              {t.columns.map((c) => (
                <tr key={c.name} style={{ borderTop: '1px solid var(--split)' }}>
                  <td className="mono" style={{ padding: '5px 8px', color: 'var(--t-1)' }}>{c.name}</td>
                  <td className="mono" style={{ padding: '5px 8px', color: 'var(--c-geekblue)' }}>{c.type}</td>
                  <td style={{ padding: '5px 8px', color: 'var(--t-3)' }}>{c.note ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {t.mistake && <p className="page-sub" style={{ marginBottom: 0, marginTop: 8 }}><b style={{ color: 'var(--c-volcano)' }}>Common mistake:</b> {t.mistake}</p>}
        </Card>
      ))}
    </div>
  );
}
