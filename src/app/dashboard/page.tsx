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
import { Plus, FolderOpen, Edit, Calendar, ArrowRight } from "lucide-react";
import { CreateProjectData } from "@/types/project";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  return (
    <div className="p-6 bg-background min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Project Dashboard
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">
                Coming Soon
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your ER diagram projects
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

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {projects.length}
                  </p>
                </div>
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recent Projects
                  </p>
                  <p className="text-2xl font-bold text-foreground">
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
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Project
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedProjectId ? "1" : "0"}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
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
        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground mb-6">
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedType, setSelectedType] = useState<"manual" | "import" | null>(
    null
  );

  const handleTypeSelect = (type: "manual" | "import") => {
    setSelectedType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && selectedType) {
      onSubmit({
        ...formData,
        type: selectedType,
      });
      setFormData({ name: "", description: "" });
      setSelectedType(null);
    }
  };

  const canSubmit = formData.name.trim() && selectedType;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Create New Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Project Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleTypeSelect("manual")}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-ring ${
                  selectedType === "manual"
                    ? "border-ring bg-accent/50"
                    : "border-border hover:bg-accent/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedType === "manual"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 bg-transparent"
                    }`}
                  >
                    {selectedType === "manual" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Create Manually
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start with an empty project and build tables and relations
                      manually
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect("import")}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-ring ${
                  selectedType === "import"
                    ? "border-ring bg-accent/50"
                    : "border-border hover:bg-accent/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedType === "import"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 bg-transparent"
                    }`}
                  >
                    {selectedType === "import" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Import from Database
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect to existing database (PostgreSQL, MySQL, Neon,
                      Hasura) and auto-generate ER diagram
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
