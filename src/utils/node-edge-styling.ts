import { Node, Edge } from "@xyflow/react";

// Define color palette for multi-color relation highlighting
const RELATION_COLORS = [
  "#8b5cf6", // Purple (original relation color)
  "#10b981", // Green (original foreign key color)
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

// Update edge styles based on selected node with multi-color highlighting
export const updateEdgeStyles = (
  edges: Edge[],
  selectedNodeId: string | null
): Edge[] => {
  if (selectedNodeId === null) {
    // No selection - show all edges with their original colors
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: 1,
      },
      labelStyle: {
        ...edge.labelStyle,
        opacity: 1,
      },
    }));
  }

  // Find all edges connected to the selected node
  const connectedEdges = edges.filter(
    (edge) => edge.source === selectedNodeId || edge.target === selectedNodeId
  );

  // Create a map of connected edges to their assigned colors
  const edgeColorMap = new Map<string, string>();
  connectedEdges.forEach((edge, index) => {
    // Use different colors for different types of relations
    let colorIndex = index % RELATION_COLORS.length;

    // If it's a foreign key relation, start from the green color
    if (edge.id.startsWith("fk-")) {
      colorIndex = (index + 1) % RELATION_COLORS.length;
    }

    edgeColorMap.set(edge.id, RELATION_COLORS[colorIndex]);
  });

  return edges.map((edge) => {
    const isRelated =
      selectedNodeId &&
      (edge.source === selectedNodeId || edge.target === selectedNodeId);
    const isHighlighted = selectedNodeId === null || isRelated;

    // Use assigned color if this edge is connected to selected node
    const highlightColor = edgeColorMap.get(edge.id);
    const strokeColor = isHighlighted
      ? highlightColor || edge.style?.stroke
      : "#9ca3af";
    const labelColor = isHighlighted
      ? highlightColor || edge.labelStyle?.fill
      : "#9ca3af";
    const markerColor = isHighlighted
      ? highlightColor ||
        (edge.markerEnd && typeof edge.markerEnd === "object"
          ? edge.markerEnd.color
          : strokeColor)
      : "#9ca3af";

    const updatedEdge: Edge = {
      ...edge,
      style: {
        ...edge.style,
        opacity: isHighlighted ? 1 : 0, // Completely hide unrelated edges
        stroke: strokeColor,
        strokeWidth: isHighlighted
          ? ((edge.style?.strokeWidth as number) || 2) * 1.5
          : 1, // Make highlighted edges thicker
        pointerEvents: isHighlighted ? "auto" : "none", // Make hidden edges non-interactive
      },
      labelStyle: {
        ...edge.labelStyle,
        opacity: isHighlighted ? 1 : 0, // Completely hide unrelated labels
        fill: labelColor,
        fontWeight: isHighlighted ? 700 : 400,
        pointerEvents: isHighlighted ? "auto" : "none", // Make hidden labels non-interactive
      },
      labelShowBg: edge.labelShowBg,
      labelBgStyle: {
        ...edge.labelBgStyle,
        fill: isHighlighted ? "#ffffff" : "#f5f5f5",
        stroke: labelColor,
        strokeWidth: isHighlighted ? 1 : 0.5,
        fillOpacity: isHighlighted ? 0.95 : 0, // Hide label backgrounds too
        strokeOpacity: isHighlighted ? 1 : 0, // Hide label borders too
      },
      labelBgPadding: edge.labelBgPadding,
      labelBgBorderRadius: edge.labelBgBorderRadius,
      interactionWidth: isHighlighted ? edge.interactionWidth || 20 : 0, // Remove interaction area for hidden edges
      selectable: Boolean(isHighlighted), // Make hidden edges non-selectable
      focusable: Boolean(isHighlighted), // Make hidden edges non-focusable
    };

    // Handle markerEnd separately to avoid type issues
    if (edge.markerEnd && typeof edge.markerEnd === "object") {
      updatedEdge.markerEnd = {
        type: edge.markerEnd.type,
        width: edge.markerEnd.width,
        height: edge.markerEnd.height,
        color: markerColor,
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
