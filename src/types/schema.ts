export interface SchemaColumn {
  name: string;
  type: string;
}

export interface Table {
  name: string;
  desc: string;
  columns: SchemaColumn[];
}

export type SchemaTables = Table[];
