import type { Module, ModuleId } from '@/types';
import { m0 } from './m0';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';
import { m8 } from './m8';
import { m9 } from './m9';
import { m10 } from './m10';
import { m11 } from './m11';
import { m12 } from './m12';
import { m13 } from './m13';

/** Ordered learning trail. Add a module file and append it here. */
export const MODULES: Module[] = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13];

const BY_ID = new Map<ModuleId, Module>(MODULES.map((m) => [m.id, m]));
export function getModule(id: ModuleId | null | undefined): Module | undefined {
  return id ? BY_ID.get(id) : undefined;
}
