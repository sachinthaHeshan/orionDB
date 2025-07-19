import { Node, Edge, MarkerType, Position } from "@xyflow/react";
import { ERTemplate } from "@/types/er-diagram";
import { parseFieldDefinition } from "@/utils/field-parser";
import { calculateOptimalEdgePositions } from "@/utils/shortest-path-calculator";

interface HandlePositionInfo {
  fieldName: string;
  sourcePosition?: Position;
  targetPosition?: Position;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}

interface EdgeInfo {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  sourceField: string;
  targetField: string;
  type: "relation" | "foreignKey";
  edgeData: Edge;
}

export const generateNodesAndEdges = (
  template: ERTemplate,
  savedPositions: Record<string, { x: number; y: number }> = {}
): { nodes: Node[]; edges: Edge[] } => {
  const newNodes: Node[] = [];
  const edgeInfos: EdgeInfo[] = [];

  // Create basic nodes first (without handle positions)
  const entityEntries = Object.entries(template.entities);
  entityEntries.forEach(([entityName, fields], index) => {
    const node: Node = {
      id: entityName,
      type: "erNode",
      position: savedPositions[entityName] || {
        x: (index % 3) * 400,
        y: Math.floor(index / 3) * 400,
      },
      data: { name: entityName, fields: fields, template: template },
    };
    newNodes.push(node);
  });

  // Collect all edge information first
  template.relations.forEach((relationship, index) => {
    const [fromEntity, fromField] = relationship.from.split(".");
    const [toEntity, toField] = relationship.to.split(".");

    const edge: Edge = {
      id: `rel-${relationship.name}-${index}`,
      source: fromEntity,
      target: toEntity,
      sourceHandle: `${fromEntity}-${fromField}-source`,
      targetHandle: `${toEntity}-${toField}-target`,
      label: relationship.name,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#8b5cf6", strokeWidth: 2 },
      labelStyle: {
        fill: "#8b5cf6",
        fontWeight: 700,
        fontSize: 12,
        fontFamily: "system-ui, sans-serif",
      },
      labelShowBg: true,
      labelBgStyle: {
        fill: "#ffffff",
        stroke: "#8b5cf6",
        strokeWidth: 1,
        fillOpacity: 0.95,
      },
      labelBgPadding: [6, 8],
      labelBgBorderRadius: 4,
      interactionWidth: 20,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#8b5cf6",
      },
    };

    edgeInfos.push({
      source: fromEntity,
      target: toEntity,
      sourceHandle: `${fromEntity}-${fromField}-source`,
      targetHandle: `${toEntity}-${toField}-target`,
      sourceField: fromField,
      targetField: toField,
      type: "relation",
      edgeData: edge,
    });
  });

  // Create edges for foreign key relationships
  entityEntries.forEach(([entityName, fields]) => {
    Object.entries(fields).forEach(([fieldName, fieldDefinition]) => {
      const parsedField = parseFieldDefinition(
        fieldDefinition,
        template,
        entityName,
        fieldName
      );
      if (parsedField.foreignKey) {
        let referencedEntity = "";
        const referencedField = "id";

        if (fieldName.endsWith("_id")) {
          referencedEntity = fieldName.replace("_id", "");
        }

        if (template.entities[referencedEntity]) {
          const foreignKeyEdge: Edge = {
            id: `fk-${entityName}-${fieldName}-${referencedEntity}-${referencedField}`,
            source: entityName,
            target: referencedEntity,
            sourceHandle: `${entityName}-${fieldName}-target`,
            targetHandle: `${referencedEntity}-${referencedField}-source`,
            label: `${fieldName} → ${referencedField}`,
            type: "straight",
            animated: false,
            style: {
              stroke: "#10b981",
              strokeWidth: 2,
              strokeDasharray: "5,5",
            },
            labelStyle: {
              fill: "#10b981",
              fontWeight: 600,
              fontSize: 11,
              fontFamily: "system-ui, sans-serif",
            },
            labelShowBg: true,
            labelBgStyle: {
              fill: "#ffffff",
              stroke: "#10b981",
              strokeWidth: 1,
              fillOpacity: 0.95,
            },
            labelBgPadding: [4, 6],
            labelBgBorderRadius: 3,
            interactionWidth: 20,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#10b981",
            },
          };

          edgeInfos.push({
            source: entityName,
            target: referencedEntity,
            sourceHandle: `${entityName}-${fieldName}-target`,
            targetHandle: `${referencedEntity}-${referencedField}-source`,
            sourceField: fieldName,
            targetField: referencedField,
            type: "foreignKey",
            edgeData: foreignKeyEdge,
          });
        }
      }
    });
  });

  // Calculate optimal positions for all edges
  const optimalEdgePositions = calculateOptimalEdgePositions(
    newNodes,
    edgeInfos
  );

  // Create handle position maps for each entity
  const entityHandlePositions = new Map<string, HandlePositionInfo[]>();

  // Combine edge info with optimal positions
  edgeInfos.forEach((edgeInfo, index) => {
    const optimalInfo = optimalEdgePositions[index];
    if (!optimalInfo) return;

    const { source, target, sourceField, targetField, type } = edgeInfo;
    const { optimalSourcePosition, optimalTargetPosition } = optimalInfo;

    // Initialize arrays if they don't exist
    if (!entityHandlePositions.has(source)) {
      entityHandlePositions.set(source, []);
    }
    if (!entityHandlePositions.has(target)) {
      entityHandlePositions.set(target, []);
    }

    const sourceHandles = entityHandlePositions.get(source)!;
    const targetHandles = entityHandlePositions.get(target)!;

    // Find or create handle position info for source field
    let sourceHandleInfo = sourceHandles.find(
      (h) => h.fieldName === sourceField
    );
    if (!sourceHandleInfo) {
      sourceHandleInfo = {
        fieldName: sourceField,
        sourcePosition: optimalSourcePosition,
        targetPosition: Position.Left,
        showSourceHandle: false,
        showTargetHandle: false,
      };
      sourceHandles.push(sourceHandleInfo);
    }

    // Find or create handle position info for target field
    let targetHandleInfo = targetHandles.find(
      (h) => h.fieldName === targetField
    );
    if (!targetHandleInfo) {
      targetHandleInfo = {
        fieldName: targetField,
        sourcePosition: Position.Right,
        targetPosition: optimalTargetPosition,
        showSourceHandle: false,
        showTargetHandle: false,
      };
      targetHandles.push(targetHandleInfo);
    }

    // Update the handle information based on edge type
    if (type === "relation") {
      sourceHandleInfo.sourcePosition = optimalSourcePosition;
      sourceHandleInfo.showSourceHandle = true;
      targetHandleInfo.targetPosition = optimalTargetPosition;
      targetHandleInfo.showTargetHandle = true;
    } else if (type === "foreignKey") {
      sourceHandleInfo.targetPosition = optimalSourcePosition;
      sourceHandleInfo.showTargetHandle = true;
      targetHandleInfo.sourcePosition = optimalTargetPosition;
      targetHandleInfo.showSourceHandle = true;
    }
  });

  // Update nodes with handle position information
  const updatedNodes = newNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      handlePositions: entityHandlePositions.get(node.id) || [],
    },
  }));

  // Create the final edges array
  const updatedEdges = edgeInfos.map((info) => info.edgeData);

  return { nodes: updatedNodes, edges: updatedEdges };
};
