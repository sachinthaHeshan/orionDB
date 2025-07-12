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
import { savePositionsToLocalStorage } from "@/utils/position-storage";

export const useERDiagram = (initialTemplate: ERTemplate) => {
  const [template, setTemplate] = useState<ERTemplate>(initialTemplate);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const currentSelectionRef = useRef<string | null>(null);

  // Enhanced onNodesChange handler to save positions
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Save positions when nodes are moved
      const hasPositionChange = changes.some(
        (change: NodeChange) =>
          change.type === "position" &&
          "dragging" in change &&
          change.dragging === false
      );

      if (hasPositionChange) {
        // Use setTimeout to ensure state is updated before saving
        setTimeout(() => {
          setNodes((currentNodes) => {
            savePositionsToLocalStorage(currentNodes);
            return currentNodes;
          });
        }, 0);
      }
    },
    [onNodesChange, setNodes]
  );

  // Handle edge connections
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Generate nodes and edges from template
  const regenerateNodesAndEdges = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } =
      generateNodesAndEdges(template);

    // Apply current selection styling if any
    const selectedNode = currentSelectionRef.current;
    const styledNodes = updateNodeStyles(newNodes, newEdges, selectedNode);
    const styledEdges = updateEdgeStyles(newEdges, selectedNode);

    setNodes(styledNodes);
    setEdges(styledEdges);
  }, [template, setNodes, setEdges]);

  // Update styles when selection changes
  const updateStyles = useCallback(
    (selectedNode: string | null) => {
      currentSelectionRef.current = selectedNode;

      // Get current state values
      const currentNodes = nodes;
      const currentEdges = edges;

      // Calculate styled versions
      const styledNodes = updateNodeStyles(
        currentNodes,
        currentEdges,
        selectedNode
      );
      const styledEdges = updateEdgeStyles(currentEdges, selectedNode);

      // Update both states
      setNodes(styledNodes);
      setEdges(styledEdges);
    },
    [setNodes, setEdges, nodes, edges]
  );

  return {
    template,
    setTemplate,
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    regenerateNodesAndEdges,
    updateStyles,
  };
};
