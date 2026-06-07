import type { LadderId } from './ladder';
import type { Mode } from './problem';

export interface Resource {
  name: string;
  url: string;
  day: string;
  use: string;
}

/** How an external resource maps into internal Gym filters (source / mode / ladder). */
export interface ResourceMapping {
  source?: string;
  concept?: string;
  mode?: Mode;
  ladder?: LadderId;
  label?: string;
}
