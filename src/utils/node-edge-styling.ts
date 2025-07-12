import { Node, Edge } from "@xyflow/react";

// Update edge styles based on selected node
export const updateEdgeStyles = (
  edges: Edge[],
  selectedNodeId: string | null
): Edge[] => {
  return edges.map((edge) => {
    const isRelated =
      selectedNodeId &&
      (edge.source === selectedNodeId || edge.target === selectedNodeId);
    const isHighlighted = selectedNodeId === null || isRelated;

    const updatedEdge: Edge = {
      ...edge,
      style: {
        ...edge.style,
        opacity: isHighlighted ? 1 : 0.3,
        stroke: isHighlighted ? edge.style?.stroke : "#9ca3af",
        strokeWidth: isHighlighted ? edge.style?.strokeWidth || 2 : 1,
      },
      labelStyle: {
        ...edge.labelStyle,
        opacity: isHighlighted ? 1 : 0.3,
        fill: isHighlighted ? edge.labelStyle?.fill : "#9ca3af",
      },
    };

    // Handle markerEnd separately to avoid type issues
    if (edge.markerEnd && typeof edge.markerEnd === "object") {
      updatedEdge.markerEnd = {
        type: edge.markerEnd.type,
        width: edge.markerEnd.width,
        height: edge.markerEnd.height,
        color: isHighlighted ? edge.markerEnd.color : "#9ca3af",
      };
    }

    return updatedEdge;
  });
};

// Update node styles based on selection
export const updateNodeStyles = (
  nodes: Node[],
  edges: Edge[],
  selectedNodeId: string | null
): Node[] => {
  if (selectedNodeId === null) {
    // No selection - show all nodes normally
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        opacity: 1,
      },
    }));
  }

  // Find all related node IDs (connected through edges)
  const relatedNodeIds = new Set<string>();
  relatedNodeIds.add(selectedNodeId); // Include the selected node itself

  edges.forEach((edge) => {
    if (edge.source === selectedNodeId) {
      relatedNodeIds.add(edge.target);
    } else if (edge.target === selectedNodeId) {
      relatedNodeIds.add(edge.source);
    }
  });

  return nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      opacity: relatedNodeIds.has(node.id) ? 1 : 0.6,
    },
  }));
};
