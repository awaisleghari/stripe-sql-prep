import { MODULES } from '@/data/modules';
import { useProgress } from '@/state/progressStore';
import { readiness } from '@/utils/scoring';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Resources } from '@/components/dashboard/Resources';
import { ModuleView } from '@/components/learning/ModuleView';
import { GymView } from '@/components/gym/GymView';
import { SchemaExplorer } from '@/components/schema/SchemaExplorer';

/** Tiny state-driven router (no react-router dependency for a 5-route SPA). */
export default function App() {
  const state = useProgress();
  const score = readiness(state, MODULES);

  return (
    <AppLayout route={state.route} readiness={score}>
      {state.route === 'dashboard' && <Dashboard />}
      {state.route === 'learn' && <ModuleView />}
      {state.route === 'gym' && <GymView />}
      {state.route === 'schema' && <SchemaExplorer />}
      {state.route === 'resources' && <Resources />}
    </AppLayout>
  );
}
