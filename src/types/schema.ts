export interface Column {
  name: string;
  type: string;
  note?: string;
}

export interface Table {
  name: string;
  grain: string;
  columns: Column[];
  joinKeys?: string[];
  whenToUse?: string;
  mistake?: string;
}

export type SchemaTables = Table[];
