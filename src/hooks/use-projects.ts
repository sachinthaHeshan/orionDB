import { useState, useEffect } from "react";
import { Project, ProjectListItem, CreateProjectData } from "@/types/project";
import { ERTemplate } from "@/types/er-diagram";
import defaultTemplate from "@/data/defaultTemplate.json";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const projectsWithDates = parsedProjects.map(
        (project: ProjectListItem) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        })
      );
      setProjects(projectsWithDates);
    } else {
      // Create default project if none exist
      const defaultProject: ProjectListItem = {
        id: "default",
        name: "Default Project",
        description: "Default ER diagram project with sample data",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      };
      setProjects([defaultProject]);
      localStorage.setItem("projects", JSON.stringify([defaultProject]));
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(projects));
    }
  }, [projects]);

  // Load current project
  useEffect(() => {
    const selectedProjectId = localStorage.getItem("selectedProjectId");
    if (selectedProjectId) {
      const savedProjects = localStorage.getItem("projects");
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        const project = parsedProjects.find(
          (p: Project) => p.id === selectedProjectId
        );
        if (project) {
          setCurrentProject({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          });
        }
      }
    }
  }, []);

  const createProject = (data: CreateProjectData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      template: data.template || (defaultTemplate as ERTemplate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to projects list
    const newProjectListItem: ProjectListItem = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      createdAt: newProject.createdAt,
      updatedAt: newProject.updatedAt,
    };

    setProjects([...projects, newProjectListItem]);

    // Save full project data
    const savedProjects = localStorage.getItem("projects");
    const allProjects = savedProjects ? JSON.parse(savedProjects) : [];
    allProjects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(allProjects));

    return newProject;
  };

  const saveProject = (project: Project) => {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const updatedProjects = parsedProjects.map((p: Project) =>
        p.id === project.id ? { ...project, updatedAt: new Date() } : p
      );
      localStorage.setItem("projects", JSON.stringify(updatedProjects));

      // Update projects list
      setProjects(
        projects.map((p) =>
          p.id === project.id ? { ...p, updatedAt: new Date() } : p
        )
      );
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));

    // Also remove from full project data
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const updatedProjects = parsedProjects.filter(
        (p: Project) => p.id !== projectId
      );
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
    }
  };

  const selectProject = (projectId: string) => {
    localStorage.setItem("selectedProjectId", projectId);

    // Load full project data
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const project = parsedProjects.find((p: Project) => p.id === projectId);
      if (project) {
        setCurrentProject({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        });
      }
    }
  };

  return {
    projects,
    currentProject,
    createProject,
    saveProject,
    deleteProject,
    selectProject,
  };
}
