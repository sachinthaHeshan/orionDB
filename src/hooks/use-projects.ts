import { useState, useEffect } from "react";
import {
  Project,
  ProjectListItem,
  CreateProjectData,
  ProjectType,
} from "@/types/project";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "@/lib/api";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProjects = await getProjects();

        // Convert to ProjectListItem format
        const projectListItems: ProjectListItem[] = fetchedProjects.map(
          (project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            type: project.type as ProjectType,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
            isDefault: project.isDefault,
          })
        );

        setProjects(projectListItems);

        // If no projects exist, you might want to create a default one
        if (projectListItems.length === 0) {
          // Optional: Create a default project
          // const defaultProject = await createProjectAPI({
          //   name: "Default Project",
          //   description: "Default ER diagram project with sample data"
          // });
          // setProjects([{
          //   id: defaultProject.id,
          //   name: defaultProject.name,
          //   description: defaultProject.description,
          //   createdAt: new Date(defaultProject.createdAt),
          //   updatedAt: new Date(defaultProject.updatedAt),
          //   isDefault: true,
          // }]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load projects"
        );
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Load current project from localStorage selection
  useEffect(() => {
    const selectedProjectId = localStorage.getItem("selectedProjectId");
    if (selectedProjectId && projects.length > 0) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        // Load full project data
        loadFullProject(selectedProjectId);
      }
    }
  }, [projects]);

  const loadFullProject = async (projectId: string) => {
    try {
      // For now, we'll find the project from our projects list
      // In the future, you might want to add a GET /api/projects/:id endpoint
      const fetchedProjects = await getProjects();
      const project = fetchedProjects.find((p) => p.id === projectId);
      if (project) {
        setCurrentProject({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        });
      }
    } catch (err) {
      console.error("Error loading full project:", err);
    }
  };

  const createProjectAPI = async (
    data: CreateProjectData
  ): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await createProject(data);

      // Add to projects list
      const newProjectListItem: ProjectListItem = {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        type: newProject.type as ProjectType,
        createdAt: new Date(newProject.createdAt),
        updatedAt: new Date(newProject.updatedAt),
      };

      setProjects([...projects, newProjectListItem]);
      return newProject;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create project";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (project: Project) => {
    try {
      setLoading(true);
      setError(null);

      // Use the API to update the project
      const updatedProject = await updateProject(project);

      // Update projects list with the updated project
      setProjects(
        projects.map((p) =>
          p.id === project.id
            ? {
                ...p,
                name: updatedProject.name,
                description: updatedProject.description,
                updatedAt: new Date(updatedProject.updatedAt),
              }
            : p
        )
      );

      // Update current project if it's the one being saved
      if (currentProject?.id === project.id) {
        setCurrentProject({
          ...updatedProject,
          createdAt: new Date(updatedProject.createdAt),
          updatedAt: new Date(updatedProject.updatedAt),
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save project";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProjectAPI = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the API to delete the project
      await deleteProject(projectId);

      // Remove from projects list
      setProjects(projects.filter((p) => p.id !== projectId));

      // Clear current project if it's the one being deleted
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        localStorage.removeItem("selectedProjectId");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete project";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (projectId: string) => {
    try {
      localStorage.setItem("selectedProjectId", projectId);
      await loadFullProject(projectId);
    } catch (err) {
      console.error("Error selecting project:", err);
    }
  };

  return {
    projects,
    currentProject,
    loading,
    error,
    createProject: createProjectAPI,
    saveProject,
    deleteProject: deleteProjectAPI,
    selectProject,
  };
}
