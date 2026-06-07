/** Data-Reasoning → SQL lookup row. */
export interface PysqlRow {
  plain: string;
  sql: string;
  py: string;
  trap: string;
  stripe: string;
}

/** One scored component of a mock interview. `rubric` references a Rubric id. */
export interface MockComponent {
  kind: string;
  rubric: string;
  prompt: string;
  guidance?: string;
  solution: string;
  notes?: string[];
}

export interface Mock {
  id: string;
  title: string;
  time: string;
  level: string;
  blurb: string;
  components: MockComponent[];
}

/** One section of the panic / final-review sheet. */
export interface PanicSection {
  h: string;
  items?: string[];
  code?: string;
}
