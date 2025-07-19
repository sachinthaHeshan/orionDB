"use client";

import React, { useEffect, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";
import { TemplateEditor } from "@/components/template-editor";
import { DiagramVisualization } from "@/components/diagram-visualization";
import { useERDiagram } from "@/hooks/use-er-diagram";
import { useNodeSelection } from "@/hooks/use-node-selection";
import { ERTemplate } from "@/types/er-diagram";
import { updateNodeStyles, updateEdgeStyles } from "@/utils/node-edge-styling";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import defaultTemplate from "@/data/defaultTemplate.json";
import { useProjects } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  const { currentProject, saveProject, loading } = useProjects();
  const [isTemplateCollapsed, setIsTemplateCollapsed] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState<ERTemplate>(
    defaultTemplate as ERTemplate
  );

  // Only initialize ER diagram after project is loaded or if no project is selected
  const projectTemplate =
    currentProject?.template || (defaultTemplate as ERTemplate);
  const projectPositions = currentProject?.positions || {};

  const {
    template,
    setTemplate,
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    regenerateNodesAndEdges,
  } = useERDiagram(projectTemplate, currentProject?.id, projectPositions);

  const { selectedNode, onNodeClick, onPaneClick } = useNodeSelection();
  const prevTemplateRef = useRef<ERTemplate>({} as ERTemplate);

  // Load current project template when available
  useEffect(() => {
    if (currentProject && currentProject.template) {
      setTemplate(currentProject.template);
      setDraftTemplate(currentProject.template);
    } else if (!currentProject && !loading) {
      // If no project is selected and not loading, use default template
      setTemplate(defaultTemplate as ERTemplate);
      setDraftTemplate(defaultTemplate as ERTemplate);
    }
  }, [currentProject, setTemplate, loading]);

  // Handle draft template changes (when user types)
  const handleDraftTemplateChange = (newTemplate: ERTemplate) => {
    setDraftTemplate(newTemplate);
  };

  // Handle template update from editor (when user clicks "Update Diagram")
  const handleTemplateUpdate = (newTemplate: ERTemplate) => {
    setTemplate(newTemplate);
    setDraftTemplate(newTemplate);
  };

  // Handle template changes
  useEffect(() => {
    const templateChanged =
      JSON.stringify(template) !== JSON.stringify(prevTemplateRef.current);

    if (templateChanged) {
      regenerateNodesAndEdges();
      prevTemplateRef.current = template;
    }
  }, [template, regenerateNodesAndEdges]);

  // Save current project with updated template
  const handleSaveProject = () => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        template,
        updatedAt: new Date(),
      };
      saveProject(updatedProject);
    }
  };

  // Apply selection styling only when not loading
  const styledNodes = !loading
    ? updateNodeStyles(nodes, edges, selectedNode)
    : [];
  const styledEdges = !loading ? updateEdgeStyles(edges, selectedNode) : [];

  // Show loading skeleton while projects are loading
  if (loading) {
    return (
      <div className="h-full flex bg-background">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 bg-card border-b border-border z-20 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>

        {/* Left Section - Template Editor Skeleton */}
        <div className="w-[400px] border-r mt-14">
          <div className="p-4 h-full">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent className="h-full">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Section - Diagram Skeleton */}
        <div className="p-4 flex-1 mt-14">
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

  return (
    <div className="h-full flex bg-background">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 bg-card border-b border-border z-20 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentProject && (
              <span className="text-sm text-muted-foreground">OrionDB</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              disabled={!currentProject}
            >
              <Save size={16} />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Left Section - Template Editor */}
      <div
        className={`border-r transition-all duration-300 ease-in-out mt-14 overflow-hidden ${
          isTemplateCollapsed ? "w-12" : "w-[400px]"
        }`}
      >
        <div className="relative h-full">
          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-5 right-5 z-10 bg-card border border-border shadow-sm hover:bg-accent rounded-[10px] transition-all duration-200 hover:scale-105"
            onClick={() => setIsTemplateCollapsed(!isTemplateCollapsed)}
          >
            <div className="transition-transform duration-200">
              {isTemplateCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </div>
          </Button>

          {/* Template Editor - only show when not collapsed */}
          {!isTemplateCollapsed && (
            <div className="p-4 h-full animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <TemplateEditor
                initialTemplate={draftTemplate}
                onDraftChange={handleDraftTemplateChange}
                onTemplateUpdate={handleTemplateUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Section - React Flow Diagram */}
      <div className="p-4 flex-1 mt-14">
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
