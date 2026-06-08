import { Suspense, lazy } from 'react';
import { MantineProvider, Center, Loader } from '@mantine/core';
import { MODULES } from '@/data/modules';
import { PROBLEMS } from '@/data/gym';
import { MOCKS } from '@/data/mock';
import { RUBRICS } from '@/data/rubrics';
import { useProgress } from '@/state/progressStore';
import { blendedReadiness } from '@/utils/scoring';
import { theme } from '@/theme/mantineTheme';
import { AppLayout } from '@/components/layout/AppLayout';

// Route views are code-split: each loads its own chunk on first navigation,
// keeping the initial bundle to the shell + the active route.
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Resources = lazy(() => import('@/components/dashboard/Resources').then((m) => ({ default: m.Resources })));
const ModuleView = lazy(() => import('@/components/learning/ModuleView').then((m) => ({ default: m.ModuleView })));
const GymView = lazy(() => import('@/components/gym/GymView').then((m) => ({ default: m.GymView })));
const SchemaExplorer = lazy(() => import('@/components/schema/SchemaExplorer').then((m) => ({ default: m.SchemaExplorer })));
const MockView = lazy(() => import('@/components/pages/MockView').then((m) => ({ default: m.MockView })));
const PanicSheet = lazy(() => import('@/components/pages/PanicSheet').then((m) => ({ default: m.PanicSheet })));
const ReasoningView = lazy(() => import('@/components/pages/ReasoningView').then((m) => ({ default: m.ReasoningView })));

/** Tiny state-driven router (no react-router dependency for a small SPA). */
export default function App() {
  const state = useProgress();
  const rubricsById = Object.fromEntries(RUBRICS.map((r) => [r.id, r]));
  const score = blendedReadiness(state, MODULES, PROBLEMS, MOCKS[0], rubricsById).overall;

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppLayout route={state.route} readiness={score}>
        <Suspense fallback={<Center mih={260}><Loader color="brand" /></Center>}>
          {state.route === 'dashboard' && <Dashboard />}
          {state.route === 'learn' && <ModuleView />}
          {state.route === 'gym' && <GymView />}
          {state.route === 'schema' && <SchemaExplorer />}
          {state.route === 'resources' && <Resources />}
          {state.route === 'reason' && <ReasoningView />}
          {state.route === 'mock' && <MockView />}
          {state.route === 'panic' && <PanicSheet />}
        </Suspense>
      </AppLayout>
    </MantineProvider>
  );
}
