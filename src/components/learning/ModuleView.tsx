import { useState } from 'react';
import type { Predict, Debug, Module } from '@/types';
import { MODULES, getModule } from '@/data/modules';
import { useProgress, openModule, answerQuiz, setConfidence, setModuleComplete, setRoute } from '@/state/progressStore';
import { quizScore, moduleReady } from '@/utils/scoring';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Callout } from '@/components/ui/Callout';
import { Collapse } from '@/components/ui/Collapse';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Labeled } from '@/components/ui/Labeled';
import { PRIORITY_META } from '@/utils/formatters';

const BADGE_COLOR = { beginner: 'green', intermediate: 'gold', advanced: 'volcano' } as const;
const html = (s: string) => ({ __html: s });

export function ModuleView() {
  const state = useProgress();
  const active = state.activeModuleId ?? MODULES[0].id;
  const m = getModule(active);
  if (!m) return <div className="empty-state">Module not found.</div>;
  const score = quizScore(m, state.modules[m.id]);

  return (
    <div>
      {/* module picker */}
      <div className="pill-row" style={{ marginBottom: 14 }}>
        {MODULES.map((mm) => (
          <Button key={mm.id} small variant={mm.id === m.id ? 'primary' : 'default'} onClick={() => openModule(mm.id)}>
            {mm.id.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="pill-row" style={{ marginBottom: 8 }}>
        <Tag color="blue">{m.day}</Tag>
        <Tag color={BADGE_COLOR[m.badge]}>{m.badge}</Tag>
        {moduleReady(m, state.modules[m.id]) && <Tag color="green">✓ interview-ready</Tag>}
      </div>
      <h2 style={{ margin: '0 0 12px' }}>{m.title}</h2>

      {/* concept */}
      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Concept</div>
        <div className="prose" dangerouslySetInnerHTML={html(m.concept)} />
        {m.sqlPattern && (
          <>
            <div className="section-label" style={{ margin: '14px 0 6px' }}>Core SQL pattern</div>
            <CodeBlock>{m.sqlPattern}</CodeBlock>
          </>
        )}
      </Card>

      {/* python analogy */}
      {m.pysupport && (
        <Card>
          <div className="section-label" style={{ marginBottom: 6 }}>The same logic in plain Python (no pandas)</div>
          <p className="page-sub" style={{ marginTop: 0 }}>If SQL feels abstract, this is the loop it compiles to in your head.</p>
          <CodeBlock>{m.pysupport}</CodeBlock>
        </Card>
      )}

      {/* reasoning framework */}
      {m.reasoning && (
        <Card>
          <div className="section-label" style={{ marginBottom: 6 }}>Reason about the data before writing SQL</div>
          {m.reasoning.question && <Labeled label="The question, restated"><span dangerouslySetInnerHTML={html(m.reasoning.question)} /></Labeled>}
          {m.reasoning.grain && <Labeled label="Output grain — one row per…"><span dangerouslySetInnerHTML={html(m.reasoning.grain)} /></Labeled>}
          {m.reasoning.metric && <Labeled label="Metric"><span dangerouslySetInnerHTML={html(m.reasoning.metric)} /></Labeled>}
          {m.reasoning.denom && <Labeled label="Denominator"><span dangerouslySetInnerHTML={html(m.reasoning.denom)} /></Labeled>}
          {m.reasoning.table && <Labeled label="Authoritative table(s)"><span dangerouslySetInnerHTML={html(m.reasoning.table)} /></Labeled>}
          {m.reasoning.included && <Labeled label="Rows included"><span dangerouslySetInnerHTML={html(m.reasoning.included)} /></Labeled>}
          {m.reasoning.excluded && <Labeled label="Rows excluded"><span dangerouslySetInnerHTML={html(m.reasoning.excluded)} /></Labeled>}
          {m.reasoning.wrong && <Labeled label="What a naive answer gets wrong"><span dangerouslySetInnerHTML={html(m.reasoning.wrong)} /></Labeled>}
          {m.reasoning.validate && <Labeled label="How to validate"><span dangerouslySetInnerHTML={html(m.reasoning.validate)} /></Labeled>}
        </Card>
      )}

      {/* predicts */}
      {m.predicts.map((pr, i) => (
        <Card key={`pred-${i}`}>
          <div className="section-label" style={{ marginBottom: 6 }}>Predict the output{m.predicts.length > 1 ? ` (${i + 1}/${m.predicts.length})` : ''}</div>
          <PredictBlock predict={pr} />
        </Card>
      ))}

      {/* debugs */}
      {m.debugs.map((d, i) => (
        <Card key={`dbg-${i}`}>
          <div className="section-label" style={{ marginBottom: 6 }}>Debug the query{m.debugs.length > 1 ? ` (${i + 1}/${m.debugs.length})` : ''}</div>
          <DebugBlock debug={d} />
        </Card>
      ))}

      {/* exercises */}
      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Exercises — climb the ladder</div>
        {[...m.exercises].sort((a, b) => a.lvl - b.lvl).map((ex) => (
          <Collapse key={ex.id} title={`L${ex.lvl} · ${ex.title}`}>
            <div className="pill-row" style={{ marginBottom: 8 }}>
              <Tag color={PRIORITY_META[ex.priority].color}>{PRIORITY_META[ex.priority].label}</Tag>
            </div>
            <div className="prose" dangerouslySetInnerHTML={html(ex.prompt)} />
            {ex.hints && ex.hints.length > 0 && (
              <Collapse title="💡 Hints">
                <ul>{ex.hints.map((h, i) => <li key={i} dangerouslySetInnerHTML={html(h)} />)}</ul>
              </Collapse>
            )}
            {ex.solution && (
              <Collapse title="✅ Solution — reveal after you try">
                <CodeBlock>{ex.solution}</CodeBlock>
              </Collapse>
            )}
          </Collapse>
        ))}
      </Card>

      {/* quiz */}
      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Quiz — {score.correct}/{score.total} correct ({score.answered} answered)</div>
        <QuizBlock module={m} />
      </Card>

      {/* mistakes & edges */}
      {(m.mistakes?.length || m.edges?.length) && (
        <Card>
          {m.mistakes && m.mistakes.length > 0 && (
            <Labeled label="⚠ Common mistakes"><ul>{m.mistakes.map((x, i) => <li key={i} dangerouslySetInnerHTML={html(x)} />)}</ul></Labeled>
          )}
          {m.edges && m.edges.length > 0 && (
            <Labeled label="🧩 Edge cases"><ul>{m.edges.map((x, i) => <li key={i} dangerouslySetInnerHTML={html(x)} />)}</ul></Labeled>
          )}
        </Card>
      )}

      {/* interview */}
      {(m.interview || m.followup) && (
        <Card>
          <div className="section-label" style={{ marginBottom: 6 }}>Explain it in an interview</div>
          {m.interview && <div className="prose" dangerouslySetInnerHTML={html(m.interview)} />}
          {m.followup && (
            <Collapse title={`Follow-up: ${m.followup.prompt}`}>
              <div className="prose" dangerouslySetInnerHTML={html(m.followup.answer)} />
            </Collapse>
          )}
        </Card>
      )}

      {/* confidence + gate */}
      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Confidence & completion</div>
        <div className="pill-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button key={n} small variant={state.modules[m.id]?.confidence === n ? 'primary' : 'default'} onClick={() => setConfidence(m.id, n)}>{n}</Button>
          ))}
          <span className="page-sub" style={{ alignSelf: 'center' }}>How confident are you? (1–5)</span>
        </div>
        <div className="pill-row" style={{ marginTop: 12 }}>
          <Button variant={state.modules[m.id]?.complete ? 'primary' : 'default'} onClick={() => setModuleComplete(m.id, !state.modules[m.id]?.complete)}>
            {state.modules[m.id]?.complete ? '✓ Marked complete' : 'Mark module complete'}
          </Button>
          <Button onClick={() => setRoute('gym')}>Practice this in the Gym →</Button>
        </div>
        {!moduleReady(m, state.modules[m.id]) && (
          <Callout variant="warn" title="Interview-ready gate">
            Answer all 5 quiz questions (≥4 correct) and mark the module complete to make it interview-ready and lift your readiness score.
          </Callout>
        )}
      </Card>
    </div>
  );
}

function PredictBlock({ predict }: { predict: Predict }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div>
      <p style={{ marginTop: 0 }} dangerouslySetInnerHTML={html(predict.prompt)} />
      {predict.query && <CodeBlock>{predict.query}</CodeBlock>}
      <div className="pill-row" style={{ margin: '10px 0' }}>
        {predict.options.map((o, i) => (
          <Button key={i} small variant={picked === i ? 'primary' : 'default'} onClick={() => setPicked(i)} style={picked !== null && i === predict.answer ? { borderColor: 'var(--c-success)' } : undefined}>
            {o}
          </Button>
        ))}
      </div>
      {picked !== null && (
        <Callout variant={picked === predict.answer ? 'tip' : 'warn'} title={picked === predict.answer ? 'Correct' : 'Not quite'}>
          {predict.explain}
        </Callout>
      )}
    </div>
  );
}

function DebugBlock({ debug }: { debug: Debug }) {
  return (
    <div>
      {debug.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{debug.title}</div>}
      <p style={{ marginTop: 0 }} dangerouslySetInnerHTML={html(debug.prompt)} />
      <CodeBlock>{debug.broken}</CodeBlock>
      <Collapse title="💡 Hint">{debug.hint}</Collapse>
      <Collapse title="✅ Fixed query & why">
        <CodeBlock>{debug.fixed}</CodeBlock>
        <p className="prose" style={{ marginTop: 8 }} dangerouslySetInnerHTML={html(debug.why)} />
      </Collapse>
    </div>
  );
}

function QuizBlock({ module: m }: { module: Module }) {
  const state = useProgress();
  const answers = state.modules[m.id]?.quiz ?? {};
  return (
    <div>
      {m.quiz.map((qq, i) => {
        const chosen = answers[i];
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              <Tag color="grey">{`Q${i + 1} · L${qq.level}`}</Tag> <span dangerouslySetInnerHTML={html(qq.q)} />
            </div>
            <div className="pill-row">
              {qq.options.map((o, oi) => (
                <Button key={oi} small variant={chosen === oi ? 'primary' : 'default'} onClick={() => answerQuiz(m.id, i, oi)}
                  style={chosen !== undefined && oi === qq.answer ? { borderColor: 'var(--c-success)' } : undefined}>
                  {o}
                </Button>
              ))}
            </div>
            {chosen !== undefined && (
              <Callout variant={chosen === qq.answer ? 'tip' : 'warn'} title={chosen === qq.answer ? 'Correct' : 'Review this'}>
                {qq.why}
              </Callout>
            )}
          </div>
        );
      })}
    </div>
  );
}
