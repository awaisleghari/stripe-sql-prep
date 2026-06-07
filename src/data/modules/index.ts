import type { Module, ModuleId } from '@/types';
import { m1Select } from './m1-select';

/** Ordered learning trail. Add a module by importing it and appending here. */
export const MODULES: Module[] = [m1Select];

const BY_ID = new Map<ModuleId, Module>(MODULES.map((m) => [m.id, m]));
export function getModule(id: ModuleId): Module | undefined {
  return BY_ID.get(id);
}
