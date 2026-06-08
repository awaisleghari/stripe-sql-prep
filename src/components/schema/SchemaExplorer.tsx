import { Group, Table, Text } from '@mantine/core';
import { SCHEMA } from '@/data/schema';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

export function SchemaExplorer() {
  return (
    <div>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Synthetic Stripe-style schema ({SCHEMA.length} tables). Money is in <b>cents</b>;{' '}
        <span className="mono">balance_transactions</span> is the ledger source of truth for net revenue.
      </p>
      {SCHEMA.map((t) => (
        <Card key={t.name}>
          <Group gap={8} mb={6} align="center">
            <Text className="mono" fw={700} fz={15}>{t.name}</Text>
            <Tag color="grey">{t.columns.length} columns</Tag>
          </Group>
          <p className="page-sub" style={{ marginTop: 0 }}>{t.desc}</p>
          <Table className="mono" fz="xs" verticalSpacing={5} withRowBorders>
            <Table.Tbody>
              {t.columns.map((c) => (
                <Table.Tr key={c.name}>
                  <Table.Td style={{ whiteSpace: 'nowrap', color: 'var(--t-1)' }}>{c.name}</Table.Td>
                  <Table.Td style={{ color: 'var(--c-geekblue)' }}>{c.type}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      ))}
    </div>
  );
}
