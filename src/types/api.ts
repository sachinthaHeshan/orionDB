import { Project } from "./project";

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Project API specific responses
export interface CreateProjectResponse extends ApiResponse<Project> {
  data: Project;
}

export interface GetProjectsResponse extends ApiResponse<Project[]> {
  data: Project[];
}

// Error response structure
export interface ApiError {
  error: string;
  status?: number;
}
