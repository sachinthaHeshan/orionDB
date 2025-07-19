"use client";

import React, { useEffect, useState, use } from "react";
import "@xyflow/react/dist/style.css";
import { DiagramVisualization } from "@/components/diagram-visualization";
import { useERDiagram } from "@/hooks/use-er-diagram";
import { useNodeSelection } from "@/hooks/use-node-selection";
import { ERTemplate } from "@/types/er-diagram";
import { Project } from "@/types/project";
import { updateNodeStyles, updateEdgeStyles } from "@/utils/node-edge-styling";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProjectViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectViewPage({ params }: ProjectViewPageProps) {
  const { id: projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only initialize ER diagram after project is loaded
  const projectTemplate = project?.template;
  const projectPositions = project?.positions || {};

  const {
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    regenerateNodesAndEdges,
    setTemplate,
  } = useERDiagram(
    projectTemplate || ({ entities: {}, relations: [] } as ERTemplate),
    projectId,
    projectPositions
  );

  const { selectedNode, onNodeClick, onPaneClick } = useNodeSelection();

  // Fetch project by ID
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Project not found");
          } else {
            setError("Failed to load project");
          }
          return;
        }

        const result = await response.json();

        if (result.success && result.data) {
          const projectData: Project = {
            ...result.data,
            createdAt: new Date(result.data.createdAt),
            updatedAt: new Date(result.data.updatedAt),
          };

          setProject(projectData);

          // Set the template for the ER diagram
          if (projectData.template) {
            setTemplate(projectData.template);
          }
        } else {
          setError("Invalid project data");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, setTemplate]);

  // Regenerate nodes and edges when project template changes
  useEffect(() => {
    if (project?.template) {
      regenerateNodesAndEdges();
    }
  }, [project?.template, regenerateNodesAndEdges]);

  // Apply selection styling only if project is loaded
  const styledNodes = project
    ? updateNodeStyles(nodes, edges, selectedNode)
    : [];
  const styledEdges = project ? updateEdgeStyles(edges, selectedNode) : [];

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>

        {/* Diagram Skeleton */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="h-full">
              <Skeleton className="h-full w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <div className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToProjects}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full border-destructive mx-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle size={20} />
                <div>
                  <h3 className="font-medium">Error loading project</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main content - only render when project is loaded
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToProjects}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {project?.name}
            </h1>
            {project?.description && (
              <p className="text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ER Diagram */}
      <div className="flex-1">
        <DiagramVisualization
          nodes={styledNodes}
          edges={styledEdges}
          selectedNode={selectedNode}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
        />
      </div>
    </div>
  );
}
