import { useState } from 'react';
import { Paper, Textarea, Group, Alert, Table, ScrollArea, Loader, Badge, Text } from '@mantine/core';
import { IconPlayerPlay, IconChecks, IconColumns, IconRefresh, IconAlertTriangle, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import type { RunResult, Comparison, Cell } from '@/sqlRunner';

const MAX_ROWS = 100;

/* Local cell formatter so this component never statically imports the sqlRunner
   (which would pull PGlite + the seed into the main bundle). */
const fmt = (c: Cell): string => (c === null ? 'NULL' : typeof c === 'boolean' ? String(c) : String(c));

function ResultGrid({ r }: { r: RunResult }) {
  if (r.columns.length === 0) return <Text size="sm" c="dimmed">Query ran; no columns returned.</Text>;
  const rows = r.rows.slice(0, MAX_ROWS);
  return (
    <div>
      <ScrollArea.Autosize mah={360} type="auto" offsetScrollbars>
        <Table striped withTableBorder withColumnBorders className="mono" fz="xs" stickyHeader>
          <Table.Thead>
            <Table.Tr>{r.columns.map((c) => (<Table.Th key={c}>{c}</Table.Th>))}</Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, ri) => (
              <Table.Tr key={ri}>
                {row.map((cell, ci) => (
                  <Table.Td key={ci} style={cell === null ? { color: 'var(--mantine-color-dimmed)', fontStyle: 'italic' } : undefined}>
                    {fmt(cell)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea.Autosize>
      <Group gap={8} mt={6}>
        <Badge variant="light" color="gray" radius="sm" leftSection={<IconColumns size={12} />} styles={{ label: { textTransform: 'none' } }}>
          {r.rowCount} {r.rowCount === 1 ? 'row' : 'rows'} · {r.elapsedMs} ms
        </Badge>
        {r.rowCount > MAX_ROWS && <Text size="xs" c="dimmed">showing first {MAX_ROWS}</Text>}
      </Group>
    </div>
  );
}

/**
 * Live Postgres console shown next to any SQL-input problem. Runs the learner's SQL against
 * a seeded in-browser PGlite sandbox, and (when a reference solution exists) checks the output
 * against it. The sqlRunner module is dynamic-imported on first use so PGlite/WASM is code-split.
 */
export function SqlConsole({ solution, starter, label = 'Run it — live Postgres sandbox' }: { solution?: string; starter?: string; label?: string }) {
  const [input, setInput] = useState(starter ?? '');
  const [running, setRunning] = useState(false);
  const [booted, setBooted] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [refResult, setRefResult] = useState<RunResult | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setComparison(null);
    setRefResult(null);
    const { runSql } = await import('@/sqlRunner');
    const r = await runSql(input);
    setResult(r);
    setBooted(true);
    setRunning(false);
  };

  const check = async () => {
    if (running || !solution) return;
    setRunning(true);
    const { runSql, compareResults } = await import('@/sqlRunner');
    const mine = await runSql(input);
    setResult(mine);
    setBooted(true);
    if (!mine.ok) {
      setComparison({ match: false, reason: 'Your query has an error — fix it, then check against the reference.' });
      setRefResult(null);
      setRunning(false);
      return;
    }
    const ref = await runSql(solution);
    setRefResult(ref);
    setComparison(
      ref.ok
        ? compareResults(mine, ref)
        : { match: false, reason: "The reference for this drill doesn't run in the live sandbox (it may use a simplified or assumed column). Your query ran against the real schema above." }
    );
    setRunning(false);
  };

  return (
    <Paper withBorder radius="md" p="md" mt="md" style={{ background: 'var(--surface-2, var(--mantine-color-dark-7))' }}>
      <Group justify="space-between" align="center" mb={8}>
        <Text fw={650} fz="sm" style={{ letterSpacing: 0.2 }}>
          <span style={{ color: 'var(--mantine-color-teal-4)' }}>▶</span> {label}
        </Text>
        <Badge variant="light" color="teal" radius="sm" styles={{ label: { textTransform: 'none' } }}>Postgres · in-browser</Badge>
      </Group>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder={'Write your SQL here, then Run.\nThe sandbox is the same synthetic Stripe schema shown in the Schema Explorer.'}
        autosize
        minRows={6}
        maxRows={20}
        spellCheck={false}
        styles={{ input: { fontFamily: 'var(--mono, ui-monospace, monospace)', fontSize: 13, lineHeight: 1.55 } }}
      />

      <Group gap={8} mt="sm">
        <Button small variant="primary" leftSection={<IconPlayerPlay size={15} />} onClick={run} disabled={running}>
          Run
        </Button>
        {solution && (
          <Button small leftSection={<IconChecks size={15} />} onClick={check} disabled={running}>
            Check vs reference
          </Button>
        )}
        {solution && (
          <Button small leftSection={<IconRefresh size={15} />} onClick={() => setInput(solution)} disabled={running}>
            Load reference solution
          </Button>
        )}
        {(input || result) && (
          <Button small onClick={() => { setInput(''); setResult(null); setComparison(null); setRefResult(null); }} disabled={running}>
            Clear
          </Button>
        )}
        {running && (
          <Group gap={6}>
            <Loader size="xs" color="teal" />
            <Text size="xs" c="dimmed">{booted ? 'Running…' : 'Booting the in-browser Postgres sandbox (one-time, ~2s)…'}</Text>
          </Group>
        )}
      </Group>

      {comparison && (
        <Alert
          mt="md"
          variant="light"
          color={comparison.match ? 'teal' : 'yellow'}
          radius="md"
          icon={comparison.match ? <IconCircleCheck /> : <IconCircleX />}
          title={comparison.match ? 'Match' : 'Not a match yet'}
        >
          {comparison.reason}
          <Text size="xs" c="dimmed" mt={4}>Heuristic set-comparison (order- and column-name-insensitive, numbers to 4dp) — not an authoritative grade.</Text>
        </Alert>
      )}

      {result && !result.ok && (
        <Alert mt="md" variant="light" color="red" radius="md" icon={<IconAlertTriangle />} title="Query error">
          <Text className="mono" fz="xs">{result.error}</Text>
          {result.hint && <Text size="sm" mt={6}>{result.hint}</Text>}
        </Alert>
      )}

      {result && result.ok && (
        <div style={{ marginTop: 14 }}>
          <ResultGrid r={result} />
        </div>
      )}

      {refResult && refResult.ok && comparison && !comparison.match && (
        <div style={{ marginTop: 14 }}>
          <Text fw={600} fz="sm" mb={6} c="dimmed">Reference output</Text>
          <ResultGrid r={refResult} />
        </div>
      )}
    </Paper>
  );
}
