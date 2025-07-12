// Type definitions for ER Diagram
export interface EntityFields {
  [fieldName: string]: string; // e.g., "id": "Int not-null primary-key unique"
}

export interface Entities {
  [entityName: string]: EntityFields;
}

export interface Relationship {
  name: string;
  from: string;
  to: string;
  type?: string;
  description?: string;
}

export interface ERTemplate {
  entities: Entities;
  relations: Relationship[];
}

export interface ParsedField {
  type: string;
  primaryKey: boolean;
  foreignKey: boolean;
  nullable: boolean;
  unique: boolean;
}
