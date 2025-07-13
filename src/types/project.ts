import { ERTemplate } from "./er-diagram";

export interface Project {
  id: string;
  name: string;
  description: string;
  template: ERTemplate;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface CreateProjectData {
  name: string;
  description: string;
  template?: ERTemplate;
}
