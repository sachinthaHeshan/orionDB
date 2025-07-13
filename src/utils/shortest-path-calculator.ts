import { Node, Position } from "@xyflow/react";

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OptimalConnection {
  sourcePosition: Position;
  targetPosition: Position;
  distance: number;
}

/**
 * Calculate the optimal handle positions for the shortest path between two nodes
 * Only uses left and right positions for clarity in field connections
 */
export const calculateOptimalHandlePositions = (
  sourceNode: Node,
  targetNode: Node,
  sourceNodeDimensions: NodePosition,
  targetNodeDimensions: NodePosition
): OptimalConnection => {
  // Define handle positions only on left and right sides for clarity
  const sourcePositions = {
    [Position.Left]: {
      x: sourceNodeDimensions.x,
      y: sourceNodeDimensions.y + sourceNodeDimensions.height / 2,
    },
    [Position.Right]: {
      x: sourceNodeDimensions.x + sourceNodeDimensions.width,
      y: sourceNodeDimensions.y + sourceNodeDimensions.height / 2,
    },
  };

  const targetPositions = {
    [Position.Left]: {
      x: targetNodeDimensions.x,
      y: targetNodeDimensions.y + targetNodeDimensions.height / 2,
    },
    [Position.Right]: {
      x: targetNodeDimensions.x + targetNodeDimensions.width,
      y: targetNodeDimensions.y + targetNodeDimensions.height / 2,
    },
  };

  // Calculate distances between all combinations of source and target positions
  let shortestDistance = Infinity;
  let optimalSource = Position.Right;
  let optimalTarget = Position.Left;

  Object.entries(sourcePositions).forEach(([sourcePos, sourcePoint]) => {
    Object.entries(targetPositions).forEach(([targetPos, targetPoint]) => {
      const distance = Math.sqrt(
        Math.pow(targetPoint.x - sourcePoint.x, 2) +
          Math.pow(targetPoint.y - sourcePoint.y, 2)
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        optimalSource = sourcePos as Position;
        optimalTarget = targetPos as Position;
      }
    });
  });

  return {
    sourcePosition: optimalSource,
    targetPosition: optimalTarget,
    distance: shortestDistance,
  };
};

/**
 * Get node dimensions from a React Flow node
 */
export const getNodeDimensions = (node: Node): NodePosition => {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width || 250, // Default width
    height: node.measured?.height || 100, // Default height
  };
};

/**
 * Calculate optimal handle positions for all edges
 */
export const calculateOptimalEdgePositions = (
  nodes: Node[],
  edges: Array<{
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
  }>
): Array<{
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  optimalSourcePosition: Position;
  optimalTargetPosition: Position;
}> => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return {
        ...edge,
        optimalSourcePosition: Position.Right,
        optimalTargetPosition: Position.Left,
      };
    }

    const sourceDimensions = getNodeDimensions(sourceNode);
    const targetDimensions = getNodeDimensions(targetNode);

    const optimal = calculateOptimalHandlePositions(
      sourceNode,
      targetNode,
      sourceDimensions,
      targetDimensions
    );

    return {
      ...edge,
      optimalSourcePosition: optimal.sourcePosition,
      optimalTargetPosition: optimal.targetPosition,
    };
  });
};
