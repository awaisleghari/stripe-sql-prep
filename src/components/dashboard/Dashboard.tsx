import { MODULES } from '@/data/modules';
import { LADDERS, PROBLEMS, getProblem } from '@/data/gym';
import { MOCKS } from '@/data/mock';
import { RUBRICS } from '@/data/rubrics';
import type { Mode, Rubric } from '@/types';
import {
  useProgress, focusProblem, openModule, setRoute, setFilters, setGymTab,
} from '@/state/progressStore';
import { categoryCoverage } from '@/state/selectors';
import { blendedReadiness, mockReadiness } from '@/utils/scoring';
import { recommendedProblemId, ladderOf, nextInCategory } from '@/utils/problemNavigation';
import { weakAreas, type NudgeAction } from '@/utils/coaching';
import { DIFFICULTY_META, MODE_LABEL, MODE_ORDER } from '@/utils/formatters';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Callout } from '@/components/ui/Callout';

const RUBRIC_BY_ID: Record<string, Rubric> = Object.fromEntries(RUBRICS.map((r) => [r.id, r]));

function Pillar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <span style={{ width: 96, fontSize: 12, color: 'var(--t-2)', fontWeight: 600 }}>{label}</span>
      <div className="progress" style={{ flex: 1 }}><div style={{ width: `${pct}%` }} /></div>
      <span style={{ width: 38, textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--t-1)' }}>{pct}%</span>
    </div>
  );
}

export function Dashboard() {
  const state = useProgress();
  const blend = blendedReadiness(state, MODULES, PROBLEMS, MOCKS[0], RUBRIC_BY_ID);
  const mock = mockReadiness(state, MOCKS[0], RUBRIC_BY_ID);
  const cov = [...categoryCoverage(state, PROBLEMS)].sort((a, b) => MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode));
  const nudges = weakAreas(state, MODULES, PROBLEMS, mock.got);
  const recId = recommendedProblemId(LADDERS, state);
  const rec = getProblem(recId);
  const recLadder = rec ? ladderOf(LADDERS, rec.id) : undefined;

  // map a coaching action to a concrete navigation
  const runAction = (a: NudgeAction) => {
    if (a.type === 'route') {
      if (a.value === 'gym') { setGymTab('browse'); }
      setRoute(a.value as 'gym' | 'learn' | 'mock');
    } else if (a.type === 'problem') {
      const p = getProblem(a.value);
      if (p) focusProblem(p.id, p.ladder);
    } else {
      const id = nextInCategory(PROBLEMS, state, a.value as Mode);
      if (id) { const p = getProblem(id)!; focusProblem(p.id, p.ladder); }
      else { setFilters({ mode: a.value as Mode }); setGymTab('browse'); setRoute('gym'); }
    }
  };

  const practiceCategory = (mode: Mode) => {
    const id = nextInCategory(PROBLEMS, state, mode);
    if (id) { const p = getProblem(id)!; focusProblem(p.id, p.ladder); }
    else { setFilters({ mode }); setGymTab('browse'); setRoute('gym'); }
  };

  return (
    <div>
      {/* blended readiness hero */}
      <Card>
        <div className="section-label">Stripe interview readiness</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '6px 0 6px' }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: 'var(--c-primary)', lineHeight: 1 }}>{blend.overall}%</span>
          <span className="page-sub">blended across foundation, practice, and simulation</span>
        </div>
        <Pillar label="Foundation" pct={blend.foundation} />
        <Pillar label="Practice" pct={blend.practice} />
        <Pillar label="Simulation" pct={blend.simulation} />
        <p className="page-sub" style={{ margin: '10px 0 0', fontSize: 11.5 }}>
          Foundation = modules made interview-ready · Practice = gym problems completed · Simulation = Mock 1 self-score
        </p>
      </Card>

      {/* coaching nudges */}
      {nudges.length > 0 && (
        <Card>
          <div className="section-label" style={{ marginBottom: 8 }}>What to work on next</div>
          {nudges.map((n, i) => (
            <Callout key={i} variant={n.kind} title={n.kind === 'warn' ? '⚠ Gap' : '▸ Suggestion'}>
              <div>{n.text}</div>
              {n.action && (
                <div style={{ marginTop: 8 }}>
                  <Button small variant="primary" onClick={() => runAction(n.action!)}>{n.action.label} →</Button>
                </div>
              )}
            </Callout>
          ))}
        </Card>
      )}

      {/* recommended next problem */}
      {rec && (
        <Card>
          <div className="section-label">Recommended next problem</div>
          <div className="pill-row" style={{ margin: '8px 0' }}>
            <strong>{rec.title}</strong>
            <Tag color={DIFFICULTY_META[rec.difficulty].color}>{DIFFICULTY_META[rec.difficulty].label}</Tag>
            {recLadder && <Tag color="geekblue">{recLadder.title}</Tag>}
          </div>
          <Button variant="primary" onClick={() => focusProblem(rec.id, rec.ladder)}>Open in Focus Mode →</Button>
        </Card>
      )}

      {/* skill coverage by category */}
      <Card>
        <div className="section-label" style={{ marginBottom: 10 }}>Skill coverage by category</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {cov.map((c) => (
            <div key={c.mode} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 13px', background: 'var(--bg-elev)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 650, fontSize: 13 }}>{MODE_LABEL[c.mode]}</span>
                <span style={{ fontSize: 12, color: c.completed === c.total ? 'var(--c-success)' : 'var(--t-2)', fontWeight: 600 }}>{c.completed}/{c.total}</span>
              </div>
              <div className="progress" style={{ margin: '8px 0' }}><div style={{ width: `${c.pct}%`, background: c.completed === c.total ? 'var(--c-success)' : 'var(--c-primary)' }} /></div>
              <Button small onClick={() => practiceCategory(c.mode)}>
                {c.completed === c.total ? 'Review →' : c.completed ? 'Continue →' : 'Start →'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* quick links */}
      <Card>
        <div className="section-label" style={{ marginBottom: 8 }}>Jump back in</div>
        <div className="pill-row">
          <Button onClick={() => openModule(MODULES[0].id)}>📚 Learning path</Button>
          <Button onClick={() => setRoute('gym')}>🏋️ Practice Gym</Button>
          <Button onClick={() => setRoute('mock')}>🎯 Mock interview</Button>
          <Button onClick={() => setRoute('panic')}>🚑 Panic sheet</Button>
        </div>
      </Card>
    </div>
  );
}
