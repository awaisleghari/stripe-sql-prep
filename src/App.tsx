import { MODULES } from '@/data/modules';
import { PROBLEMS } from '@/data/gym';
import { MOCKS } from '@/data/mock';
import { RUBRICS } from '@/data/rubrics';
import { useProgress } from '@/state/progressStore';
import { blendedReadiness } from '@/utils/scoring';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Resources } from '@/components/dashboard/Resources';
import { ModuleView } from '@/components/learning/ModuleView';
import { GymView } from '@/components/gym/GymView';
import { SchemaExplorer } from '@/components/schema/SchemaExplorer';
import { MockView } from '@/components/pages/MockView';
import { PanicSheet } from '@/components/pages/PanicSheet';
import { ReasoningView } from '@/components/pages/ReasoningView';

/** Tiny state-driven router (no react-router dependency for a 5-route SPA). */
export default function App() {
  const state = useProgress();
  const rubricsById = Object.fromEntries(RUBRICS.map((r) => [r.id, r]));
  const score = blendedReadiness(state, MODULES, PROBLEMS, MOCKS[0], rubricsById).overall;

  return (
    <AppLayout route={state.route} readiness={score}>
      {state.route === 'dashboard' && <Dashboard />}
      {state.route === 'learn' && <ModuleView />}
      {state.route === 'gym' && <GymView />}
      {state.route === 'schema' && <SchemaExplorer />}
      {state.route === 'resources' && <Resources />}
      {state.route === 'reason' && <ReasoningView />}
      {state.route === 'mock' && <MockView />}
      {state.route === 'panic' && <PanicSheet />}
    </AppLayout>
  );
}
