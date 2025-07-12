import { Node, Edge, MarkerType } from "@xyflow/react";
import { ERTemplate } from "@/types/er-diagram";
import { parseFieldDefinition } from "@/utils/field-parser";
import { loadPositionsFromLocalStorage } from "@/utils/position-storage";

export const generateNodesAndEdges = (
  template: ERTemplate
): { nodes: Node[]; edges: Edge[] } => {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];

  // Load saved positions
  const savedPositions = loadPositionsFromLocalStorage();

  // Create nodes for each entity
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

  // Create edges for explicit relationships (field-to-field)
  template.relations.forEach((relationship, index) => {
    // Parse the from and to fields (e.g., "user.id" -> entity: "user", field: "id")
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
      labelStyle: { fill: "#8b5cf6", fontWeight: 700 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#8b5cf6",
      },
    };
    newEdges.push(edge);
  });

  // Create edges for foreign key relationships (field-to-field)
  entityEntries.forEach(([entityName, fields]) => {
    Object.entries(fields).forEach(([fieldName, fieldDefinition]) => {
      const parsedField = parseFieldDefinition(
        fieldDefinition,
        template,
        entityName,
        fieldName
      );
      if (parsedField.foreignKey) {
        // Try to infer the referenced entity/field based on naming convention
        // e.g., "user_id" -> references "user.id"
        let referencedEntity = "";
        const referencedField = "id";

        if (fieldName.endsWith("_id")) {
          referencedEntity = fieldName.replace("_id", "");
        }

        // Check if the referenced entity exists
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
              fontSize: 12,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#10b981",
            },
          };
          newEdges.push(foreignKeyEdge);
        }
      }
    });
  });

  return { nodes: newNodes, edges: newEdges };
};
