import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";

export const useNodeSelection = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Handle node click to select/deselect
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      setSelectedNode(node.id === selectedNode ? null : node.id);
    },
    [selectedNode]
  );

  // Handle background click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return {
    selectedNode,
    onNodeClick,
    onPaneClick,
    clearSelection,
    setSelectedNode,
  };
};
