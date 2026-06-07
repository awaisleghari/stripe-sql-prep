import { useState } from 'react';
import { MODULES, getModule } from '@/data/modules';
import { useProgress, openModule, answerQuiz, setConfidence, setModuleComplete, setRoute } from '@/state/progressStore';
import { quizScore, moduleReady } from '@/utils/scoring';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Callout } from '@/components/ui/Callout';
import { Collapse } from '@/components/ui/Collapse';
import { CodeBlock } from '@/components/ui/CodeBlock';

const BADGE_COLOR = { beginner: 'green', intermediate: 'gold', advanced: 'volcano' } as const;

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
            {mm.id.toUpperCase()} · {mm.title}
          </Button>
        ))}
      </div>

      <div className="pill-row" style={{ marginBottom: 8 }}>
        <Tag color="blue">{m.day}</Tag>
        <Tag color={BADGE_COLOR[m.badge]}>{m.badge}</Tag>
        {moduleReady(m, state.modules[m.id]) && <Tag color="green">✓ interview-ready</Tag>}
      </div>
      <h2 style={{ margin: '0 0 4px' }}>{m.title}</h2>
      {m.meta && <p className="page-sub" style={{ marginTop: 0 }}>{m.meta.why}</p>}

      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Concept</div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: m.concept }} />
        {m.sqlPattern && (
          <>
            <div className="section-label" style={{ margin: '12px 0 6px' }}>Minimal SQL pattern</div>
            <CodeBlock>{m.sqlPattern}</CodeBlock>
          </>
        )}
      </Card>

      {m.predict && (
        <Card className="" >
          <div className="section-label" style={{ marginBottom: 6 }}>Predict the output</div>
          <Predict moduleId={m.id} />
        </Card>
      )}

      {m.debug && (
        <Card>
          <div className="section-label" style={{ marginBottom: 6 }}>Debug</div>
          <p style={{ marginTop: 0 }} dangerouslySetInnerHTML={{ __html: m.debug.prompt }} />
          <CodeBlock>{m.debug.broken}</CodeBlock>
          <Collapse title="Hint">{m.debug.hint}</Collapse>
          <Collapse title="✅ Fixed query & why">
            <CodeBlock>{m.debug.fixed}</CodeBlock>
            <p className="prose" style={{ marginTop: 8 }}>{m.debug.why}</p>
          </Collapse>
        </Card>
      )}

      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Exercises</div>
        {m.exercises.map((ex) => (
          <Collapse key={ex.id} title={`${ex.difficulty.toUpperCase()} — ${ex.prompt}`}>
            {ex.solution && <CodeBlock>{ex.solution}</CodeBlock>}
            {ex.explain && <p className="prose" style={{ marginTop: 8 }}>{ex.explain}</p>}
          </Collapse>
        ))}
      </Card>

      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Quiz — {score.correct}/{score.total} correct ({score.answered} answered)</div>
        <Quiz moduleId={m.id} />
      </Card>

      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Confidence & completion</div>
        <div className="pill-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button key={n} small variant={state.modules[m.id]?.confidence === n ? 'primary' : 'default'} onClick={() => setConfidence(m.id, n)}>{n}</Button>
          ))}
          <span className="page-sub" style={{ alignSelf: 'center' }}>How confident are you? (1–5)</span>
        </div>
        <div className="pill-row" style={{ marginTop: 12 }}>
          <Button
            variant={state.modules[m.id]?.complete ? 'primary' : 'default'}
            onClick={() => setModuleComplete(m.id, !state.modules[m.id]?.complete)}
          >
            {state.modules[m.id]?.complete ? '✓ Marked complete' : 'Mark module complete'}
          </Button>
          <Button onClick={() => setRoute('gym')}>Practice this in the Gym →</Button>
        </div>
        {!score.all && <Callout variant="warn" title="Gate">Answer all 5 quiz questions (≥4 correct) and mark complete to make this module interview-ready.</Callout>}
      </Card>
    </div>
  );
}

function Predict({ moduleId }: { moduleId: string }) {
  const m = getModule(moduleId)!;
  const [picked, setPicked] = useState<number | null>(null);
  const pr = m.predict!;
  return (
    <div>
      <p style={{ marginTop: 0 }} dangerouslySetInnerHTML={{ __html: pr.prompt }} />
      {pr.query && <CodeBlock>{pr.query}</CodeBlock>}
      <div className="pill-row" style={{ margin: '10px 0' }}>
        {pr.options.map((o, i) => (
          <Button key={i} small variant={picked === i ? 'primary' : 'default'} onClick={() => setPicked(i)}>{o}</Button>
        ))}
      </div>
      {picked !== null && (
        <Callout variant={picked === pr.answer ? 'tip' : 'warn'} title={picked === pr.answer ? 'Correct' : 'Not quite'}>
          {pr.explain}
        </Callout>
      )}
    </div>
  );
}

function Quiz({ moduleId }: { moduleId: string }) {
  const state = useProgress();
  const m = getModule(moduleId)!;
  const answers = state.modules[m.id]?.quiz ?? {};
  return (
    <div>
      {m.quiz.map((qq, i) => {
        const chosen = answers[i];
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              <Tag color="grey">{`Q${i + 1} of 5 · L${qq.level}`}</Tag> {qq.q}
            </div>
            <div className="pill-row">
              {qq.options.map((o, oi) => {
                const isChosen = chosen === oi;
                const isAnswer = qq.answer === oi;
                const variant = isChosen ? 'primary' : 'default';
                return (
                  <Button key={oi} small variant={variant} onClick={() => answerQuiz(m.id, i, oi)}
                    style={chosen !== undefined && isAnswer ? { borderColor: 'var(--c-success)' } : undefined}>
                    {o}
                  </Button>
                );
              })}
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
