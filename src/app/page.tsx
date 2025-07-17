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

export default function Home() {
  const {
    template,
    setTemplate,
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    regenerateNodesAndEdges,
  } = useERDiagram(defaultTemplate as ERTemplate);
  const { selectedNode, onNodeClick, onPaneClick } = useNodeSelection();
  const prevTemplateRef = useRef<ERTemplate>({} as ERTemplate);
  const [isTemplateCollapsed, setIsTemplateCollapsed] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState<ERTemplate>(
    defaultTemplate as ERTemplate
  );
  const { currentProject, saveProject } = useProjects();

  // Load current project template when available
  useEffect(() => {
    if (currentProject && currentProject.template) {
      setTemplate(currentProject.template);
      setDraftTemplate(currentProject.template);
    }
  }, [currentProject, setTemplate]);

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

  // Apply selection styling
  const styledNodes = updateNodeStyles(nodes, edges, selectedNode);
  const styledEdges = updateEdgeStyles(edges, selectedNode);

  return (
    <div className="h-full flex bg-background">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 bg-card border-b border-border z-20 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentProject && (
              <span className="text-sm text-muted-foreground">
                {currentProject.name}
              </span>
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
        className={`border-r transition-all duration-300 ease-in-out mt-14 ${
          isTemplateCollapsed ? "w-12" : "w-1/2 max-w-[500px]"
        }`}
      >
        <div className="relative h-full">
          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-5 right-5 z-10 bg-card border border-border shadow-sm hover:bg-accent rounded-[10px]"
            onClick={() => setIsTemplateCollapsed(!isTemplateCollapsed)}
          >
            {isTemplateCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </Button>

          {/* Template Editor - only show when not collapsed */}
          {!isTemplateCollapsed && (
            <div className="p-4 h-full">
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
