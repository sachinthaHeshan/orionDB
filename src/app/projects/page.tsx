"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  FolderOpen,
  Edit,
  Calendar,
  ArrowRight,
  Search,
} from "lucide-react";
import { CreateProjectData } from "@/types/project";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const { projects, createProject, deleteProject, selectProject } =
    useProjects();

  // Load selected project ID from localStorage after component mounts
  useEffect(() => {
    const storedProjectId = localStorage.getItem("selectedProjectId");
    setSelectedProjectId(storedProjectId);
  }, []);

  const handleCreateProject = (data: CreateProjectData) => {
    createProject(data);
    setIsCreateModalOpen(false);
  };

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    router.push("/");
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your ER diagram projects
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            New Project
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.length}
                  </p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Recent Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      projects.filter((p) => {
                        const daysSinceUpdate =
                          (Date.now() - p.updatedAt.getTime()) /
                          (1000 * 60 * 60 * 24);
                        return daysSinceUpdate <= 7;
                      }).length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Project
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedProjectId ? "1" : "0"}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.description}
                    </CardDescription>
                  </div>
                  {project.isDefault && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: {formatDate(project.createdAt)}</span>
                    <span>Updated: {formatDate(project.updatedAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSelectProject(project.id)}
                      className="flex-1"
                    >
                      <ArrowRight size={14} />
                      Open
                    </Button>
                    {!project.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or create a new project
            </p>
          </div>
        )}

        {/* Empty State - No projects */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first ER diagram project to get started
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}

function CreateProjectModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateProjectData) => void;
}) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      setFormData({ name: "", description: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
