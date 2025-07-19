import { useState, useCallback, useRef } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
} from "@xyflow/react";
import { ERTemplate } from "@/types/er-diagram";
import { generateNodesAndEdges } from "@/utils/node-edge-generator";
import { updateNodeStyles, updateEdgeStyles } from "@/utils/node-edge-styling";
import { savePositionsToDatabase } from "@/utils/position-storage";

export const useERDiagram = (
  initialTemplate: ERTemplate,
  projectId?: string,
  currentPositions: Record<string, { x: number; y: number }> = {}
) => {
  const [template, setTemplate] = useState<ERTemplate>(initialTemplate);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const currentSelectionRef = useRef<string | null>(null);

  // Enhanced onNodesChange handler to save positions
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Check if nodes were moved
      const hasPositionChange = changes.some(
        (change: NodeChange) =>
          change.type === "position" &&
          "dragging" in change &&
          change.dragging === false
      );

      if (hasPositionChange && projectId) {
        // Use setTimeout to ensure state is updated before processing
        setTimeout(() => {
          setNodes((currentNodes) => {
            // Save positions to database
            savePositionsToDatabase(projectId, currentNodes).catch((error) => {
              console.error("Failed to save positions to database:", error);
            });

            // Don't recalculate edge positions - let the user's position changes persist
            return currentNodes;
          });
        }, 0);
      }
    },
    [onNodesChange, setNodes, projectId]
  );

  // Handle edge connections
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Generate nodes and edges from template
  const regenerateNodesAndEdges = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(
      template,
      currentPositions
    );

    // Apply current selection styling if any
    const selectedNode = currentSelectionRef.current;
    const styledNodes = updateNodeStyles(newNodes, newEdges, selectedNode);
    const styledEdges = updateEdgeStyles(newEdges, selectedNode);

    setNodes(styledNodes);
    setEdges(styledEdges);
  }, [template, setNodes, setEdges, currentPositions]);

  return {
    template,
    setTemplate,
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    regenerateNodesAndEdges,
  };
};
