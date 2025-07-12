"use client";

import React, { useEffect, useRef } from "react";
import "@xyflow/react/dist/style.css";
import { TemplateEditor } from "@/components/template-editor";
import { DiagramVisualization } from "@/components/diagram-visualization";
import { useERDiagram } from "@/hooks/use-er-diagram";
import { useNodeSelection } from "@/hooks/use-node-selection";
import { ERTemplate } from "@/types/er-diagram";
import { updateNodeStyles, updateEdgeStyles } from "@/utils/node-edge-styling";
import defaultTemplate from "@/data/defaultTemplate.json";

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

  // Handle template update from editor
  const handleTemplateUpdate = (newTemplate: ERTemplate) => {
    setTemplate(newTemplate);
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

  // Apply selection styling
  const styledNodes = updateNodeStyles(nodes, edges, selectedNode);
  const styledEdges = updateEdgeStyles(edges, selectedNode);

  return (
    <div className="h-screen flex">
      {/* Left Section - Template Editor */}
      <div className="w-1/2 p-4 border-r">
        <TemplateEditor
          initialTemplate={defaultTemplate as ERTemplate}
          onTemplateUpdate={handleTemplateUpdate}
        />
      </div>

      {/* Right Section - React Flow Diagram */}
      <div className="w-1/2 p-4">
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
