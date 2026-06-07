export interface RubricCriterion {
  c: string;
  /** the "two-line" description of what a strong answer looks like */
  two: string;
}

export interface Rubric {
  id: string;
  name: string;
  max: number;
  criteria: RubricCriterion[];
}
