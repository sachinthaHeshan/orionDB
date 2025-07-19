import { ERTemplate } from "./er-diagram";

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  template: ERTemplate;
  positions?: Record<string, { x: number; y: number }>;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export type ProjectType = "manual" | "import";

export interface CreateProjectData {
  name: string;
  description: string;
  type: ProjectType;
}
