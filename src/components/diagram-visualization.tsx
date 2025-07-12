import React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  NodeTypes,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ERNode } from "@/components/er-node";

const nodeTypes: NodeTypes = {
  erNode: ERNode,
};

interface DiagramVisualizationProps {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Edge | Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
}

export const DiagramVisualization: React.FC<DiagramVisualizationProps> = ({
  nodes,
  edges,
  selectedNode,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>ER Diagram Visualization</CardTitle>
        {selectedNode && (
          <div className="text-sm text-blue-600 font-medium">
            Selected: {selectedNode} (Click background to deselect)
          </div>
        )}
      </CardHeader>
      <CardContent className="h-full pb-4">
        <div className="h-full border rounded-md">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};
