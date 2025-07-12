import { Node } from "@xyflow/react";

const STORAGE_KEY = "er-diagram-positions";

export const savePositionsToLocalStorage = (nodes: Node[]) => {
  const positions = nodes.reduce((acc, node) => {
    acc[node.id] = node.position;
    return acc;
  }, {} as Record<string, { x: number; y: number }>);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
};

export const loadPositionsFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Error loading positions from localStorage:", error);
    return {};
  }
};
