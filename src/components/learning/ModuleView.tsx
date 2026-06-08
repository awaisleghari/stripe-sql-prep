import { useState } from 'react';
import { Tabs, Paper, Badge, Alert, Accordion, Radio, Rating, Group, Stack, Progress } from '@mantine/core';
import {
  IconBulb,
  IconEye,
  IconBug,
  IconStairsUp,
  IconAlertTriangle,
  IconMicrophone,
  IconChecklist,
  IconGauge,
  IconInfoCircle,
  IconTargetArrow,
  IconCircleCheck,
  IconCircleX,
  type Icon as TablerIcon,
} from '@tabler/icons-react';
import type { Predict, Debug, Module, Badge as ModuleBadge, TagColor, ReasoningFramework } from '@/types';
import { MODULES, getModule } from '@/data/modules';
import { MODULE_META } from '@/data/modules/meta';
import { useProgress, answerQuiz, setConfidence, setModuleComplete, setExerciseDone, setRoute } from '@/state/progressStore';
import { quizScore, moduleReady } from '@/utils/scoring';
import { PRIORITY_META } from '@/utils/formatters';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Labeled } from '@/components/ui/Labeled';
import { Button } from '@/components/ui/Button';
import { wrapProse } from '@/utils/richText';

const html = (s: string) => ({ __html: s });
/** Like html(), but also chips bare SQL keywords / identifiers in the text. */
const richHtml = (s: string) => ({ __html: wrapProse(s) });

const HOWTO =
  'Work the tabs left to right — Concept (mental model and SQL pattern), Predict an output, Debug a broken query, climb the Exercise ladder, study Pitfalls, rehearse the Interview script, then take the 5-question Quiz and rate your Confidence. Scoring 4/5 or better on the quiz (plus one harder exercise) marks the module interview-ready and lifts your readiness score.';

const CONF_LABEL = ['Not rated', 'New', 'Shaky', 'Familiar', 'Confident', 'Strong'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TAG_COLOR: Record<TagColor, string> = {
  blue: 'brand',
  geekblue: 'indigo',
  gold: 'yellow',
  green: 'teal',
  grey: 'gray',
  red: 'red',
  volcano: 'orange',
};
const BADGE_COLOR: Record<ModuleBadge, string> = { beginner: 'teal', intermediate: 'yellow', advanced: 'orange' };

function PTag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <Badge variant="light" color={color} radius="sm" fw={600} styles={{ label: { textTransform: 'none' } }}>
      {children}
    </Badge>
  );
}

function SectionLabel({ children, mb = 8 }: { children: React.ReactNode; mb?: number }) {
  return (
    <div className="section-label" style={{ marginBottom: mb }}>
      {children}
    </div>
  );
}

function TabEmpty({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

type ModuleTab = {
  value: string;
  label: string;
  color: string;
  accent: string;
  Icon: TablerIcon;
  Comp: React.ComponentType<{ m: Module }>;
};

/** Each section owns a hue — the tab, its ink bar, and the accent spine on its content. */
const MODULE_TABS: ModuleTab[] = [
  { value: 'concept', label: 'Concept', color: 'blue', accent: '#6f9bff', Icon: IconBulb, Comp: ConceptTab },
  { value: 'predict', label: 'Predict', color: 'grape', accent: '#b692f6', Icon: IconEye, Comp: PredictTab },
  { value: 'debug', label: 'Debug', color: 'orange', accent: '#f0976b', Icon: IconBug, Comp: DebugTab },
  { value: 'exercises', label: 'Exercises', color: 'teal', accent: '#46c98b', Icon: IconStairsUp, Comp: ExercisesTab },
  { value: 'pitfalls', label: 'Pitfalls', color: 'red', accent: '#f0726b', Icon: IconAlertTriangle, Comp: PitfallsTab },
  { value: 'interview', label: 'Interview', color: 'cyan', accent: '#4dc9d6', Icon: IconMicrophone, Comp: InterviewTab },
  { value: 'quiz', label: 'Quiz', color: 'yellow', accent: '#e6c14b', Icon: IconChecklist, Comp: QuizTab },
  { value: 'confidence', label: 'Confidence', color: 'green', accent: '#5fd28a', Icon: IconGauge, Comp: ConfidenceTab },
];

export function ModuleView() {
  const state = useProgress();
  const active = state.activeModuleId ?? MODULES[0].id;
  const m = getModule(active);
  if (!m) return <div className="empty-state">Module not found.</div>;
  const ms = state.modules[m.id];
  const ready = moduleReady(m, ms);
  const meta = MODULE_META[m.id];
  const conf = ms?.confidence ?? 0;
  const att = ms?.att ?? {};
  const exDone = m.exercises.filter((ex) => att[ex.id]).length;

  return (
    <div>
      <div className="mod-hero">
        <h1 className="hero-title">{m.title}</h1>
        {meta?.why && <p className="hero-why">{meta.why}</p>}
        <Group gap={6} mt="md">
          <PTag color={BADGE_COLOR[m.badge]}>{cap(m.badge)}</PTag>
          <PTag color="indigo">{m.day}</PTag>
          <PTag color="grape">{exDone}/{m.exercises.length} drills</PTag>
          <PTag color="gray">{CONF_LABEL[conf]}</PTag>
          {ready && <PTag color="teal">✓ Interview-ready</PTag>}
        </Group>
        <Alert variant="light" color="cyan" mt="md" radius="md" icon={<IconInfoCircle />} title="How to use this page">
          {HOWTO}
        </Alert>
      </div>

      {meta?.outcome && (
        <Alert variant="light" color="teal" mb="md" radius="md" icon={<IconTargetArrow />} title="What you'll be able to do">
          By the end of this module you can {meta.outcome}
        </Alert>
      )}

      <Tabs defaultValue="concept" keepMounted={false} variant="default">
        <Tabs.List>
          {MODULE_TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} color={t.color} leftSection={<t.Icon size={15} />}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {MODULE_TABS.map((t) => (
          <Tabs.Panel key={t.value} value={t.value} pt="lg">
            <div className="tab-accent" style={{ ['--accent' as string]: t.accent } as React.CSSProperties}>
              <t.Comp m={m} />
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

function reasoningRows(r: ReasoningFramework) {
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
    .map(([label, v], i) => (
      <Labeled key={i} label={label}>
        <span dangerouslySetInnerHTML={html(v as string)} />
      </Labeled>
    ));
}

function ConceptTab({ m }: { m: Module }) {
  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <div className="prose" dangerouslySetInnerHTML={html(m.concept)} />
        {m.sqlPattern && (
          <>
            <SectionLabel mb={6}>Core SQL pattern</SectionLabel>
            <CodeBlock>{m.sqlPattern}</CodeBlock>
          </>
        )}
      </Paper>
      {m.pysupport && (
        <Paper withBorder p="md" radius="md">
          <SectionLabel mb={6}>The same logic in plain Python (no pandas)</SectionLabel>
          <p className="page-sub" style={{ marginTop: 0 }}>If SQL feels abstract, this is the loop it compiles to in your head.</p>
          <CodeBlock>{m.pysupport}</CodeBlock>
        </Paper>
      )}
      {m.reasoning && (
        <Paper withBorder p="md" radius="md">
          <SectionLabel mb={6}>Reason about the data before writing SQL</SectionLabel>
          {reasoningRows(m.reasoning)}
        </Paper>
      )}
    </Stack>
  );
}

function PredictTab({ m }: { m: Module }) {
  if (!m.predicts.length) return <TabEmpty>No predict drills for this module yet.</TabEmpty>;
  return (
    <Stack gap="md">
      <p className="page-sub" style={{ marginTop: 0 }}>
        Read the query, then pick what it returns. Predicting output is the fastest way to build real intuition for how each clause behaves.
      </p>
      {m.predicts.map((pr, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <SectionLabel>{m.predicts.length > 1 ? `Prediction ${i + 1} of ${m.predicts.length}` : 'Predict the output'}</SectionLabel>
          <PredictBlock predict={pr} />
        </Paper>
      ))}
    </Stack>
  );
}

function DebugTab({ m }: { m: Module }) {
  if (!m.debugs.length) return <TabEmpty>No debug drills for this module yet.</TabEmpty>;
  return (
    <Stack gap="md">
      <p className="page-sub" style={{ marginTop: 0 }}>
        Each query looks plausible but is subtly wrong. Find the bug, say it in one sentence, then reveal the fix to check yourself.
      </p>
      {m.debugs.map((d, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <SectionLabel>{d.title ?? (m.debugs.length > 1 ? `Debug ${i + 1} of ${m.debugs.length}` : 'Fix the broken query')}</SectionLabel>
          <DebugBlock debug={d} />
        </Paper>
      ))}
    </Stack>
  );
}

function ExercisesTab({ m }: { m: Module }) {
  const state = useProgress();
  const att = state.modules[m.id]?.att ?? {};
  const sorted = [...m.exercises].sort((a, b) => a.lvl - b.lvl);
  const doneCount = sorted.filter((ex) => att[ex.id]).length;
  const pct = sorted.length ? Math.round((doneCount / sorted.length) * 100) : 0;

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <p className="page-sub" style={{ margin: 0 }}>Each level adds one kind of difficulty. Mark each drill done as you clear it.</p>
        <PTag color={doneCount ? 'teal' : 'gray'}>{doneCount} / {sorted.length} done</PTag>
      </Group>
      <Progress value={pct} color="teal" size="sm" radius="xl" />
      <Accordion variant="separated" radius="md" mt={4}>
        {sorted.map((ex) => {
          const done = !!att[ex.id];
          return (
            <Accordion.Item key={ex.id} value={ex.id}>
              <Accordion.Control
                icon={
                  <Badge variant={done ? 'filled' : 'light'} color={done ? 'teal' : 'gray'} radius="sm" size="sm" styles={{ label: { textTransform: 'none' } }}>
                    {done ? '✓' : ''}L{ex.lvl}
                  </Badge>
                }
              >
                {ex.title}
              </Accordion.Control>
              <Accordion.Panel>
                <Group gap={6} mb="sm">
                  <PTag color={TAG_COLOR[PRIORITY_META[ex.priority].color]}>{PRIORITY_META[ex.priority].label}</PTag>
                </Group>
                <div className="prose" dangerouslySetInnerHTML={html(ex.prompt)} />
                {ex.hints && ex.hints.length > 0 && (
                  <Accordion variant="separated" radius="md" mt="sm">
                    <Accordion.Item value="hints">
                      <Accordion.Control icon={<IconBulb size={16} color="var(--mantine-color-yellow-4)" />}>Hints</Accordion.Control>
                      <Accordion.Panel>
                        <ul className="prose">
                          {ex.hints.map((h, i) => (
                            <li key={i} dangerouslySetInnerHTML={richHtml(h)} />
                          ))}
                        </ul>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}
                {ex.solution && (
                  <Accordion variant="separated" radius="md" mt="sm">
                    <Accordion.Item value="sol">
                      <Accordion.Control icon={<IconCircleCheck size={16} color="var(--mantine-color-teal-4)" />}>Solution — reveal after you try</Accordion.Control>
                      <Accordion.Panel>
                        <CodeBlock>{ex.solution}</CodeBlock>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}
                <Group mt="md">
                  <Button
                    small
                    variant={done ? 'primary' : 'default'}
                    leftSection={done ? <IconCircleCheck size={15} /> : undefined}
                    onClick={() => setExerciseDone(m.id, ex.id, !done)}
                  >
                    {done ? 'Done' : 'Mark this drill done'}
                  </Button>
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Stack>
  );
}

function PitfallsTab({ m }: { m: Module }) {
  const hasMistakes = !!m.mistakes?.length;
  const hasEdges = !!m.edges?.length;
  if (!hasMistakes && !hasEdges) return <TabEmpty>No pitfalls recorded for this module.</TabEmpty>;
  return (
    <Stack gap="md">
      {hasMistakes && (
        <Paper withBorder p="md" radius="md">
          <SectionLabel>⚠ Common mistakes</SectionLabel>
          <ul className="prose">
            {m.mistakes!.map((x, i) => (
              <li key={i} dangerouslySetInnerHTML={richHtml(x)} />
            ))}
          </ul>
        </Paper>
      )}
      {hasEdges && (
        <Paper withBorder p="md" radius="md">
          <SectionLabel>🧩 Edge cases</SectionLabel>
          <ul className="prose">
            {m.edges!.map((x, i) => (
              <li key={i} dangerouslySetInnerHTML={richHtml(x)} />
            ))}
          </ul>
        </Paper>
      )}
    </Stack>
  );
}

function InterviewTab({ m }: { m: Module }) {
  if (!m.interview && !m.followup) return <TabEmpty>No interview script for this module yet.</TabEmpty>;
  return (
    <Stack gap="md">
      {m.interview && (
        <Paper withBorder p="md" radius="md">
          <SectionLabel>How to explain it in an interview</SectionLabel>
          <div className="prose" dangerouslySetInnerHTML={html(m.interview)} />
        </Paper>
      )}
      {m.followup && (
        <Accordion variant="separated" radius="md">
          <Accordion.Item value="followup">
            <Accordion.Control icon={<IconMicrophone size={16} color="var(--mantine-color-cyan-4)" />}>Follow-up: {m.followup.prompt}</Accordion.Control>
            <Accordion.Panel>
              <div className="prose" dangerouslySetInnerHTML={html(m.followup.answer)} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
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
      <SectionLabel>
        Quiz — {score.correct}/{score.total} correct ({score.answered} answered)
      </SectionLabel>
      <p className="page-sub" style={{ marginTop: 0, marginBottom: 16 }}>
        Each question maps to a rung of the L0→L5 ladder. Scoring 4/5 or better (plus an L4/L5 exercise) marks the module interview-ready.
      </p>
      <Stack gap="lg">
        {m.quiz.map((qq, i) => {
          const chosen = answers[i];
          const answered = chosen !== undefined;
          const correct = answered && chosen === qq.answer;
          return (
            <div key={i}>
              <Group gap={8} mb={8} align="center">
                <Badge variant="light" color="gray" radius="sm" styles={{ label: { textTransform: 'none' } }}>
                  {`Q${i + 1} · L${qq.level}`}
                </Badge>
                <span className="prose" style={{ fontWeight: 600 }} dangerouslySetInnerHTML={html(qq.q)} />
              </Group>
              <Radio.Group value={answered ? String(chosen) : ''} onChange={(v) => answerQuiz(m.id, i, Number(v))}>
                <Stack gap="xs">
                  {qq.options.map((o, oi) => (
                    <Radio key={oi} value={String(oi)} label={o} />
                  ))}
                </Stack>
              </Radio.Group>
              {answered && (
                <Alert
                  mt="sm"
                  variant="light"
                  color={correct ? 'teal' : 'yellow'}
                  radius="md"
                  icon={correct ? <IconCircleCheck /> : <IconCircleX />}
                  title={correct ? 'Correct' : 'Review this'}
                >
                  <span dangerouslySetInnerHTML={html(qq.why)} />
                </Alert>
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
  const score = quizScore(m, ms);
  const att = ms?.att ?? {};
  const exDone = m.exercises.filter((ex) => att[ex.id]).length;
  return (
    <Stack gap="lg">
      <Paper withBorder p="md" radius="md">
        <SectionLabel mb={10}>Module progress</SectionLabel>
        <Group gap={6}>
          <PTag color={exDone ? 'grape' : 'gray'}>{exDone}/{m.exercises.length} drills done</PTag>
          <PTag color={score.correct >= 4 ? 'teal' : 'gray'}>quiz {score.correct}/{score.total}</PTag>
          <PTag color={ms?.complete ? 'teal' : 'gray'}>{ms?.complete ? 'marked complete' : 'not complete'}</PTag>
        </Group>
      </Paper>
      <Paper withBorder p="md" radius="md">
        <SectionLabel mb={10}>How confident are you on this topic right now?</SectionLabel>
        <Rating value={ms?.confidence ?? 0} onChange={(n) => setConfidence(m.id, n)} count={5} size="lg" color="yellow" />
      </Paper>
      <Group>
        <Button variant={ms?.complete ? 'primary' : 'default'} onClick={() => setModuleComplete(m.id, !ms?.complete)}>
          {ms?.complete ? '✓ Marked complete' : 'Mark module complete'}
        </Button>
        <Button onClick={() => setRoute('gym')}>Practice this in the Gym →</Button>
      </Group>
      {!ready && (
        <Alert variant="light" color="yellow" radius="md" icon={<IconAlertTriangle />} title="Interview-ready gate">
          Clear a few drills, answer all 5 quiz questions (≥4 correct), and mark the module complete to make it interview-ready and lift your readiness score.
        </Alert>
      )}
    </Stack>
  );
}

function PredictBlock({ predict }: { predict: Predict }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && picked === predict.answer;
  return (
    <div>
      <p className="prose" style={{ marginTop: 0 }} dangerouslySetInnerHTML={html(predict.prompt)} />
      {predict.query && <CodeBlock>{predict.query}</CodeBlock>}
      <Radio.Group value={picked === null ? '' : String(picked)} onChange={(v) => setPicked(Number(v))}>
        <Stack gap="xs" mt="sm">
          {predict.options.map((o, i) => (
            <Radio key={i} value={String(i)} label={o} />
          ))}
        </Stack>
      </Radio.Group>
      {picked !== null && (
        <Alert
          mt="md"
          variant="light"
          color={correct ? 'teal' : 'yellow'}
          radius="md"
          icon={correct ? <IconCircleCheck /> : <IconCircleX />}
          title={correct ? 'Correct' : 'Not quite'}
        >
          <span dangerouslySetInnerHTML={html(predict.explain)} />
        </Alert>
      )}
    </div>
  );
}

function DebugBlock({ debug }: { debug: Debug }) {
  return (
    <div>
      <p className="prose" style={{ marginTop: 0 }} dangerouslySetInnerHTML={html(debug.prompt)} />
      <CodeBlock>{debug.broken}</CodeBlock>
      <Accordion variant="separated" radius="md" mt="sm">
        <Accordion.Item value="hint">
          <Accordion.Control icon={<IconBulb size={16} color="var(--mantine-color-yellow-4)" />}>Hint</Accordion.Control>
          <Accordion.Panel>
            <span className="prose" dangerouslySetInnerHTML={richHtml(debug.hint)} />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="fix">
          <Accordion.Control icon={<IconCircleCheck size={16} color="var(--mantine-color-teal-4)" />}>Fixed query & why</Accordion.Control>
          <Accordion.Panel>
            <CodeBlock>{debug.fixed}</CodeBlock>
            <p className="prose" style={{ marginTop: 8 }} dangerouslySetInnerHTML={html(debug.why)} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
