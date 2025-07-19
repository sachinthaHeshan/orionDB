import { Node } from "@xyflow/react";

// Database-based position storage functions

export const savePositionsToDatabase = async (
  projectId: string,
  nodes: Node[]
) => {
  try {
    const positions = nodes.reduce((acc, node) => {
      acc[node.id] = node.position;
      return acc;
    }, {} as Record<string, { x: number; y: number }>);

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ positions }),
    });

    if (!response.ok) {
      throw new Error("Failed to save positions to database");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving positions to database:", error);
    throw error;
  }
};

export const loadPositionsFromDatabase = async (projectId: string) => {
  try {
    const response = await fetch(`/api/projects/${projectId}`);

    if (!response.ok) {
      throw new Error("Failed to load project from database");
    }

    const result = await response.json();

    if (result.success && result.data && result.data.positions) {
      return result.data.positions;
    }

    return {};
  } catch (error) {
    console.error("Error loading positions from database:", error);
    return {};
  }
};

// Legacy localStorage functions (kept for backward compatibility)
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
