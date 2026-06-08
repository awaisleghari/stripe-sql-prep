import { useSyncExternalStore } from 'react';
import type { ProgressState, Route, GymTab, ProblemId, ModuleId } from '@/types';
import { STORAGE_KEY } from './localStorageKeys';

/**
 * The ONLY place localStorage is touched. UI never reads/writes storage directly —
 * it calls these actions and subscribes via useProgress().
 * Node-safe: falls back to an in-memory map when localStorage is unavailable (tests/SSR).
 */
const memory = new Map<string, string>();
const backend = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const k = '__probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return localStorage;
    }
  } catch {
    /* fall through to memory */
  }
  return {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  } as Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
})();

export function freshState(): ProgressState {
  return {
    startedAt: Date.now(),
    route: 'dashboard',
    activeModuleId: null,
    modules: {},
    problems: {},
    gym: { tab: 'path', ladder: 'cond', focus: null, last: null, filters: {} },
    mock: {},
  };
}

function load(): ProgressState {
  try {
    const raw = backend.getItem(STORAGE_KEY);
    if (raw) return { ...freshState(), ...(JSON.parse(raw) as Partial<ProgressState>) };
  } catch {
    /* ignore corrupt state */
  }
  return freshState();
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function commit(next: ProgressState): void {
  state = next;
  try {
    backend.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — keep in-memory */
  }
  listeners.forEach((l) => l());
}

export function getState(): ProgressState {
  return state;
}
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/** Test-only: reset to a clean state. */
export function __resetForTests(): void {
  commit(freshState());
}

/* ---------------- actions (the only mutations) ---------------- */
export function setRoute(route: Route): void {
  commit({ ...state, route });
}
export function openModule(id: ModuleId): void {
  commit({ ...state, route: 'learn', activeModuleId: id });
}
export function setModuleComplete(id: ModuleId, complete: boolean): void {
  commit({ ...state, modules: { ...state.modules, [id]: { ...state.modules[id], complete } } });
}
export function answerQuiz(id: ModuleId, qIndex: number, option: number): void {
  const m = state.modules[id] ?? {};
  commit({ ...state, modules: { ...state.modules, [id]: { ...m, quiz: { ...(m.quiz ?? {}), [qIndex]: option } } } });
}
export function setConfidence(id: ModuleId, value: number): void {
  commit({ ...state, modules: { ...state.modules, [id]: { ...state.modules[id], confidence: value } } });
}
/** Mark a learning-module exercise/drill done (stored under the module's `att` map). */
export function setExerciseDone(id: ModuleId, exId: string, done: boolean): void {
  const m = state.modules[id] ?? {};
  commit({ ...state, modules: { ...state.modules, [id]: { ...m, att: { ...(m.att ?? {}), [exId]: done } } } });
}
export function setProblemStatus(id: ProblemId, status: 'attempted' | 'completed' | 'review'): void {
  const prev = state.problems[id] ?? {};
  const next =
    status === 'completed'
      ? { ...prev, completed: true, attempted: true, needsReview: false }
      : status === 'review'
        ? { ...prev, needsReview: true, attempted: true }
        : { ...prev, attempted: true };
  commit({ ...state, problems: { ...state.problems, [id]: next } });
}
export function setGymTab(tab: GymTab): void {
  commit({ ...state, gym: { ...state.gym, tab } });
}
export function selectLadder(ladder: string): void {
  commit({ ...state, gym: { ...state.gym, ladder, tab: 'path' } });
}
export function focusProblem(id: ProblemId, ladder: string): void {
  commit({ ...state, gym: { ...state.gym, focus: id, last: id, ladder, tab: 'focus' } });
}
export function setFilters(filters: ProgressState['gym']['filters']): void {
  commit({ ...state, gym: { ...state.gym, filters } });
}
export function setMockScore(componentKey: string, criterionIndex: number, score: number): void {
  const comp = { ...(state.mock[componentKey] ?? {}), [criterionIndex]: score };
  commit({ ...state, mock: { ...state.mock, [componentKey]: comp } });
}

/** React binding. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getState, getState);
}
