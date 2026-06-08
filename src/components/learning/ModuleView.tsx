import { useState } from 'react';
import { Tabs, Card, Tag, Alert, Collapse, Radio, Button, Rate, Descriptions, Space } from 'antd';
import type { TabsProps, CollapseProps, DescriptionsProps } from 'antd';
import type { Predict, Debug, Module, Badge, TagColor, ReasoningFramework } from '@/types';
import { MODULES, getModule } from '@/data/modules';
import { MODULE_META } from '@/data/modules/meta';
import { useProgress, answerQuiz, setConfidence, setModuleComplete, setRoute } from '@/state/progressStore';
import { quizScore, moduleReady } from '@/utils/scoring';
import { PRIORITY_META } from '@/utils/formatters';
import { CodeBlock } from '@/components/ui/CodeBlock';

const html = (s: string) => ({ __html: s });

const HOWTO =
  'Work the tabs left to right — Concept (mental model and SQL pattern), Predict an output, Debug a broken query, climb the Exercise ladder, study Pitfalls, rehearse the Interview script, then take the 5-question Quiz and rate your Confidence. Scoring 4/5 or better on the quiz (plus one harder exercise) marks the module interview-ready and lifts your readiness score.';

const CONF_LABEL = ['Not rated', 'New', 'Shaky', 'Familiar', 'Confident', 'Strong'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Full-width vertical stack with a consistent gap (flex column → children stretch). */
function Stack({ gap = 16, children }: { gap?: number; children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;
}

/** Map our internal TagColor palette to Ant Tag preset colors; 'grey' falls back to default. */
const TAG_PRESET: Record<Exclude<TagColor, 'grey'>, string> = {
  blue: 'blue',
  geekblue: 'geekblue',
  gold: 'gold',
  green: 'green',
  red: 'red',
  volcano: 'volcano',
};
function PaletteTag({ color, children }: { color: TagColor; children: React.ReactNode }) {
  return color === 'grey' ? <Tag>{children}</Tag> : <Tag color={TAG_PRESET[color]}>{children}</Tag>;
}

const BADGE_COLOR: Record<Badge, TagColor> = { beginner: 'green', intermediate: 'gold', advanced: 'volcano' };

export function ModuleView() {
  const state = useProgress();
  const active = state.activeModuleId ?? MODULES[0].id;
  const m = getModule(active);
  if (!m) return <div className="empty-state">Module not found.</div>;
  const ms = state.modules[m.id];
  const ready = moduleReady(m, ms);
  const meta = MODULE_META[m.id];
  const conf = ms?.confidence ?? 0;

  const tabs: TabsProps['items'] = [
    { key: 'concept', label: 'Concept', children: <ConceptTab m={m} /> },
    { key: 'predict', label: 'Predict', children: <PredictTab m={m} /> },
    { key: 'debug', label: 'Debug', children: <DebugTab m={m} /> },
    { key: 'exercises', label: 'Exercises', children: <ExercisesTab m={m} /> },
    { key: 'pitfalls', label: 'Pitfalls', children: <PitfallsTab m={m} /> },
    { key: 'interview', label: 'Interview', children: <InterviewTab m={m} /> },
    { key: 'quiz', label: 'Quiz', children: <QuizTab m={m} /> },
    { key: 'confidence', label: 'Confidence', children: <ConfidenceTab m={m} /> },
  ];

  return (
    <div>
      <div className="mod-hero">
        <h1 className="hero-title">{m.title}</h1>
        {meta?.why && <p className="hero-why">{meta.why}</p>}
        <Space size={6} wrap style={{ marginTop: 12 }}>
          <PaletteTag color={BADGE_COLOR[m.badge]}>{cap(m.badge)}</PaletteTag>
          <PaletteTag color="geekblue">{m.day}</PaletteTag>
          <Tag>{CONF_LABEL[conf]}</Tag>
          {ready && <Tag color="success">✓ Interview-ready</Tag>}
        </Space>
        <div className="ph-howto">
          <span className="ph-howto-label">How to use this page</span>
          {HOWTO}
        </div>
      </div>
      {meta?.outcome && (
        <div className="outcome-panel">
          <span className="op-label">What you'll be able to do</span>
          By the end of this module you can {meta.outcome}
        </div>
      )}
      <Tabs defaultActiveKey="concept" items={tabs} />
    </div>
  );
}

function TabEmpty({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function reasoningItems(r: ReasoningFramework): DescriptionsProps['items'] {
  const fields: [string, string | undefined][] = [
    ['The question, restated', r.question],
    ['Output grain — one row per…', r.grain],
    ['Metric', r.metric],
    ['Denominator', r.denom],
    ['Authoritative table(s)', r.table],
    ['Rows included', r.included],
    ['Rows excluded', r.excluded],
    ['What a naive answer gets wrong', r.wrong],
    ['How to validate', r.validate],
  ];
  return fields
    .filter(([, v]) => !!v)
    .map(([label, v], i) => ({
      key: i,
      label,
      children: <span dangerouslySetInnerHTML={html(v as string)} />,
    }));
}

function ConceptTab({ m }: { m: Module }) {
  return (
    <Stack gap={16}>
      <Card size="small">
        <div className="prose" dangerouslySetInnerHTML={html(m.concept)} />
        {m.sqlPattern && (
          <>
            <div className="section-label" style={{ margin: '14px 0 6px' }}>Core SQL pattern</div>
            <CodeBlock>{m.sqlPattern}</CodeBlock>
          </>
        )}
      </Card>
      {m.pysupport && (
        <Card size="small">
          <div className="section-label" style={{ marginBottom: 6 }}>The same logic in plain Python (no pandas)</div>
          <p className="page-sub" style={{ marginTop: 0 }}>If SQL feels abstract, this is the loop it compiles to in your head.</p>
          <CodeBlock>{m.pysupport}</CodeBlock>
        </Card>
      )}
      {m.reasoning && (
        <Card size="small">
          <div className="section-label" style={{ marginBottom: 10 }}>Reason about the data before writing SQL</div>
          <Descriptions column={1} size="small" bordered items={reasoningItems(m.reasoning)} />
        </Card>
      )}
    </Stack>
  );
}

function PredictTab({ m }: { m: Module }) {
  if (!m.predicts.length) return <TabEmpty>No predict drills for this module yet.</TabEmpty>;
  return (
    <Stack gap={16}>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Read the query, then pick what it returns. Predicting output is the fastest way to build real intuition for how each clause behaves.
      </p>
      {m.predicts.map((pr, i) => (
        <Card key={i} size="small" title={m.predicts.length > 1 ? `Prediction ${i + 1} of ${m.predicts.length}` : 'Predict the output'}>
          <PredictBlock predict={pr} />
        </Card>
      ))}
    </Stack>
  );
}

function DebugTab({ m }: { m: Module }) {
  if (!m.debugs.length) return <TabEmpty>No debug drills for this module yet.</TabEmpty>;
  return (
    <Stack gap={16}>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Each query looks plausible but is subtly wrong. Find the bug, say it in one sentence, then reveal the fix to check yourself.
      </p>
      {m.debugs.map((d, i) => (
        <Card key={i} size="small" title={d.title ?? (m.debugs.length > 1 ? `Debug ${i + 1} of ${m.debugs.length}` : 'Fix the broken query')}>
          <DebugBlock debug={d} />
        </Card>
      ))}
    </Stack>
  );
}

function ExercisesTab({ m }: { m: Module }) {
  const sorted = [...m.exercises].sort((a, b) => a.lvl - b.lvl);
  const items: CollapseProps['items'] = sorted.map((ex) => ({
    key: ex.id,
    label: (
      <span>
        <Tag>{`L${ex.lvl}`}</Tag> {ex.title}
      </span>
    ),
    children: (
      <div>
        <Space size={6} wrap style={{ marginBottom: 8 }}>
          <PaletteTag color={PRIORITY_META[ex.priority].color}>{PRIORITY_META[ex.priority].label}</PaletteTag>
        </Space>
        <div className="prose" dangerouslySetInnerHTML={html(ex.prompt)} />
        {ex.hints && ex.hints.length > 0 && (
          <Collapse
            size="small"
            style={{ marginTop: 10 }}
            items={[
              {
                key: 'hints',
                label: '💡 Hints',
                children: (
                  <ul className="prose">
                    {ex.hints.map((h, i) => (
                      <li key={i} dangerouslySetInnerHTML={html(h)} />
                    ))}
                  </ul>
                ),
              },
            ]}
          />
        )}
        {ex.solution && (
          <Collapse
            size="small"
            style={{ marginTop: 10 }}
            items={[{ key: 'sol', label: '✅ Solution — reveal after you try', children: <CodeBlock>{ex.solution}</CodeBlock> }]}
          />
        )}
      </div>
    ),
  }));
  return (
    <Stack gap={12}>
      <p className="page-sub" style={{ marginTop: 0 }}>Each level adds one new kind of difficulty. Attempt at least three to unlock completion.</p>
      <Collapse items={items} />
    </Stack>
  );
}

function PitfallsTab({ m }: { m: Module }) {
  const hasMistakes = !!m.mistakes?.length;
  const hasEdges = !!m.edges?.length;
  if (!hasMistakes && !hasEdges) return <TabEmpty>No pitfalls recorded for this module.</TabEmpty>;
  return (
    <Stack gap={16}>
      {hasMistakes && (
        <Card size="small">
          <div className="section-label" style={{ marginBottom: 8 }}>⚠ Common mistakes</div>
          <ul className="prose">
            {m.mistakes!.map((x, i) => (
              <li key={i} dangerouslySetInnerHTML={html(x)} />
            ))}
          </ul>
        </Card>
      )}
      {hasEdges && (
        <Card size="small">
          <div className="section-label" style={{ marginBottom: 8 }}>🧩 Edge cases</div>
          <ul className="prose">
            {m.edges!.map((x, i) => (
              <li key={i} dangerouslySetInnerHTML={html(x)} />
            ))}
          </ul>
        </Card>
      )}
    </Stack>
  );
}

function InterviewTab({ m }: { m: Module }) {
  if (!m.interview && !m.followup) return <TabEmpty>No interview script for this module yet.</TabEmpty>;
  return (
    <Stack gap={16}>
      {m.interview && (
        <Card size="small">
          <div className="section-label" style={{ marginBottom: 8 }}>How to explain it in an interview</div>
          <div className="prose" dangerouslySetInnerHTML={html(m.interview)} />
        </Card>
      )}
      {m.followup && (
        <Collapse
          size="small"
          items={[
            {
              key: 'followup',
              label: `Follow-up: ${m.followup.prompt}`,
              children: <div className="prose" dangerouslySetInnerHTML={html(m.followup.answer)} />,
            },
          ]}
        />
      )}
    </Stack>
  );
}

function QuizTab({ m }: { m: Module }) {
  const state = useProgress();
  const ms = state.modules[m.id];
  const score = quizScore(m, ms);
  const answers = ms?.quiz ?? {};
  return (
    <div>
      <div className="section-label" style={{ marginBottom: 8 }}>
        Quiz — {score.correct}/{score.total} correct ({score.answered} answered)
      </div>
      <p className="page-sub" style={{ marginTop: 0, marginBottom: 16 }}>
        Each question maps to a rung of the L0→L5 ladder. Scoring ≥4/5 (plus an L4/L5 exercise) marks the module interview-ready.
      </p>
      <Stack gap={18}>
        {m.quiz.map((qq, i) => {
          const chosen = answers[i];
          const answered = chosen !== undefined;
          const correct = answered && chosen === qq.answer;
          return (
            <div key={i}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                <Tag>{`Q${i + 1} · L${qq.level}`}</Tag> <span dangerouslySetInnerHTML={html(qq.q)} />
              </div>
              <Radio.Group
                value={answered ? chosen : null}
                onChange={(e) => answerQuiz(m.id, i, e.target.value)}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                {qq.options.map((o, oi) => (
                  <Radio key={oi} value={oi}>
                    {o}
                  </Radio>
                ))}
              </Radio.Group>
              {answered && (
                <Alert
                  style={{ marginTop: 10 }}
                  type={correct ? 'success' : 'warning'}
                  showIcon
                  message={correct ? 'Correct' : 'Review this'}
                  description={<span dangerouslySetInnerHTML={html(qq.why)} />}
                />
              )}
            </div>
          );
        })}
      </Stack>
    </div>
  );
}

function ConfidenceTab({ m }: { m: Module }) {
  const state = useProgress();
  const ms = state.modules[m.id];
  const ready = moduleReady(m, ms);
  return (
    <Stack gap={18}>
      <Card size="small">
        <div className="section-label" style={{ marginBottom: 10 }}>How confident are you on this topic right now?</div>
        <Rate value={ms?.confidence ?? 0} onChange={(n) => setConfidence(m.id, n)} />
      </Card>
      <Space wrap>
        <Button type={ms?.complete ? 'primary' : 'default'} onClick={() => setModuleComplete(m.id, !ms?.complete)}>
          {ms?.complete ? '✓ Marked complete' : 'Mark module complete'}
        </Button>
        <Button onClick={() => setRoute('gym')}>Practice this in the Gym →</Button>
      </Space>
      {!ready && (
        <Alert
          type="warning"
          showIcon
          message="Interview-ready gate"
          description="Answer all 5 quiz questions (≥4 correct) and mark the module complete to make it interview-ready and lift your readiness score."
        />
      )}
    </Stack>
  );
}

function PredictBlock({ predict }: { predict: Predict }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && picked === predict.answer;
  return (
    <div>
      <p style={{ marginTop: 0 }} dangerouslySetInnerHTML={html(predict.prompt)} />
      {predict.query && <CodeBlock>{predict.query}</CodeBlock>}
      <Radio.Group
        value={picked}
        onChange={(e) => setPicked(e.target.value)}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0' }}
      >
        {predict.options.map((o, i) => (
          <Radio key={i} value={i}>
            {o}
          </Radio>
        ))}
      </Radio.Group>
      {picked !== null && (
        <Alert
          type={correct ? 'success' : 'warning'}
          showIcon
          message={correct ? 'Correct' : 'Not quite'}
          description={<span dangerouslySetInnerHTML={html(predict.explain)} />}
        />
      )}
    </div>
  );
}

function DebugBlock({ debug }: { debug: Debug }) {
  const items: CollapseProps['items'] = [
    { key: 'hint', label: '💡 Hint', children: <span dangerouslySetInnerHTML={html(debug.hint)} /> },
    {
      key: 'fix',
      label: '✅ Fixed query & why',
      children: (
        <>
          <CodeBlock>{debug.fixed}</CodeBlock>
          <p className="prose" style={{ marginTop: 8 }} dangerouslySetInnerHTML={html(debug.why)} />
        </>
      ),
    },
  ];
  return (
    <div>
      <p style={{ marginTop: 0 }} dangerouslySetInnerHTML={html(debug.prompt)} />
      <CodeBlock>{debug.broken}</CodeBlock>
      <Collapse size="small" style={{ marginTop: 10 }} items={items} />
    </div>
  );
}
