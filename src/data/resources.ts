import type { Resource, ResourceMapping } from '@/types';

export const RESOURCES: Resource[] = [
  { name: 'SQLBolt', url: 'https://sqlbolt.com', day: 'Day 1', use: 'Foundations. Do the matching SQL ladder rungs first, then use this for extra reps.' },
  { name: 'PostgreSQL Exercises', url: 'https://pgexercises.com', day: 'Days 1–3', use: 'Progressive joins/aggregation/windows. Pattern inspiration for SQL ladders.' },
  { name: 'Mode SQL tutorial', url: 'https://mode.com/sql-tutorial', day: 'Days 2–4', use: 'Analytics SQL: windows, funnels, retention thinking.' },
  { name: 'stripe-interview / python-interview-prep', url: 'https://github.com/stripe/stripe-interview', day: 'Days 3–6', use: 'Clean Python interview style. Maps to the Python Production Scripting ladder.' },
];

/** Resource name -> internal Gym filter it should open. */
export const RESOURCE_MAP: Record<string, ResourceMapping> = {
  'SQLBolt': { source: 'SQLBolt-style', label: 'SQL foundations' },
  'PostgreSQL Exercises': { source: 'pgexercises-style', label: 'SQL practice' },
  'Mode SQL tutorial': { source: 'Mode-style', label: 'Analytics SQL' },
  'stripe-interview / python-interview-prep': { mode: 'Python', label: 'Python Production Scripting' },
};
