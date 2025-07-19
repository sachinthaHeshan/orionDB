import { CreateProjectData, Project } from "@/types/project";
import {
  CreateProjectResponse,
  GetProjectsResponse,
  ApiError,
} from "@/types/api";

const API_BASE_URL = "/api";

// Create a new project
export async function createProject(
  projectData: CreateProjectData
): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    const data: CreateProjectResponse | ApiError = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || "Failed to create project");
    }

    return (data as CreateProjectResponse).data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while creating the project");
  }
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: GetProjectsResponse | ApiError = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || "Failed to fetch projects");
    }

    return (data as GetProjectsResponse).data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while fetching projects");
  }
}

// Update a project
export async function updateProject(project: Project): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    });

    const data: CreateProjectResponse | ApiError = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || "Failed to update project");
    }

    return (data as CreateProjectResponse).data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while updating the project");
  }
}

// Delete a project
export async function deleteProject(projectId: string): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects?id=${projectId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: CreateProjectResponse | ApiError = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || "Failed to delete project");
    }

    return (data as CreateProjectResponse).data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while deleting the project");
  }
}

// Example usage in a React component:
/*
import { createProject, updateProject, deleteProject } from '@/lib/api';

const handleCreateProject = async () => {
  try {
    const newProject = await createProject({
      name: "My Project",
      description: "A description of my project"
    });
    console.log('Project created:', newProject);
    // Handle success (e.g., update state, show notification)
  } catch (error) {
    console.error('Error creating project:', error);
    // Handle error (e.g., show error message)
  }
};

const handleUpdateProject = async (project) => {
  try {
    const updatedProject = await updateProject(project);
    console.log('Project updated:', updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
  }
};

const handleDeleteProject = async (projectId) => {
  try {
    const deletedProject = await deleteProject(projectId);
    console.log('Project deleted:', deletedProject);
  } catch (error) {
    console.error('Error deleting project:', error);
  }
};
*/
