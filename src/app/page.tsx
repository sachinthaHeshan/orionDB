"use client";

import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  MarkerType,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/database-schema-node";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import defaultTemplate from "@/data/defaultTemplate.json";

// Type definitions
interface EntityFields {
  [fieldName: string]: string; // e.g., "id": "Int not-null primary-key unique"
}

interface Entities {
  [entityName: string]: EntityFields;
}

interface Relationship {
  name: string;
  from: string;
  to: string;
  type?: string;
  description?: string;
}

interface ERTemplate {
  entities: Entities;
  relations: Relationship[];
}

// Helper function to parse field definition
const parseFieldDefinition = (definition: string) => {
  const parts = definition.toLowerCase().split(/\s+/);
  return {
    type: parts[0] || "varchar",
    primaryKey: parts.includes("primary-key"),
    foreignKey: parts.includes("foreign-key"),
    nullable: !parts.includes("not-null"),
    unique: parts.includes("unique"),
  };
};

// Custom Node Component
const ERNode = ({
  data,
  selected,
}: {
  data: { name: string; fields: EntityFields };
  selected?: boolean;
}) => {
  const fieldEntries = Object.entries(data.fields);

  return (
    <DatabaseSchemaNode
      className={`min-w-[250px] transition-all duration-200 ${
        selected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <DatabaseSchemaNodeHeader>
        <div className="font-semibold text-foreground">{data.name}</div>
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        {fieldEntries.map(([fieldName, fieldDefinition], index) => {
          const parsedField = parseFieldDefinition(fieldDefinition);
          return (
            <DatabaseSchemaTableRow
              key={index}
              entityName={data.name}
              attributeName={fieldName}
              isPrimaryKey={parsedField.primaryKey}
              isForeignKey={parsedField.foreignKey}
            >
              <DatabaseSchemaTableCell className="font-medium">
                {fieldName}
              </DatabaseSchemaTableCell>
              <DatabaseSchemaTableCell className="text-muted-foreground">
                {parsedField.type}
              </DatabaseSchemaTableCell>
              <DatabaseSchemaTableCell className="text-xs">
                {parsedField.primaryKey && (
                  <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs mr-1">
                    PK
                  </span>
                )}
                {parsedField.foreignKey && (
                  <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs mr-1">
                    FK
                  </span>
                )}
                {!parsedField.nullable && (
                  <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs mr-1">
                    NOT NULL
                  </span>
                )}
                {parsedField.unique && (
                  <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs">
                    UNIQUE
                  </span>
                )}
              </DatabaseSchemaTableCell>
            </DatabaseSchemaTableRow>
          );
        })}
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
};

// Node types
const nodeTypes: NodeTypes = {
  erNode: ERNode,
};

export default function Home() {
  const [templateText, setTemplateText] = useState(
    JSON.stringify(defaultTemplate, null, 2)
  );
  const [template, setTemplate] = useState<ERTemplate>(defaultTemplate);
  const [error, setError] = useState<string>("");
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Functions to save/load positions from localStorage
  const savePositionsToLocalStorage = useCallback((nodes: Node[]) => {
    const positions = nodes.reduce((acc, node) => {
      acc[node.id] = node.position;
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
    localStorage.setItem("er-diagram-positions", JSON.stringify(positions));
  }, []);

  const loadPositionsFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("er-diagram-positions");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading positions from localStorage:", error);
      return {};
    }
  }, []);

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
    [onNodesChange, savePositionsToLocalStorage, setNodes]
  );

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

  // Update edge styles based on selected node
  const updateEdgeStyles = useCallback(
    (edges: Edge[], selectedNodeId: string | null) => {
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
    },
    []
  );

  // Update node styles based on selection
  const updateNodeStyles = useCallback(
    (nodes: Node[], edges: Edge[], selectedNodeId: string | null) => {
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
    },
    []
  );

  // Convert template to nodes and edges
  const generateNodesAndEdges = useCallback(
    (template: ERTemplate) => {
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
          data: { name: entityName, fields: fields },
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
          const parsedField = parseFieldDefinition(fieldDefinition);
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

      // Apply styling based on current selection
      const styledNodes = updateNodeStyles(newNodes, newEdges, selectedNode);
      const styledEdges = updateEdgeStyles(newEdges, selectedNode);

      setNodes(styledNodes);
      setEdges(styledEdges);
    },
    [
      setNodes,
      setEdges,
      loadPositionsFromLocalStorage,
      selectedNode,
      updateNodeStyles,
      updateEdgeStyles,
    ]
  );

  // Handle template update
  const updateTemplate = useCallback(() => {
    try {
      const parsed = JSON.parse(templateText);
      setTemplate(parsed);
      setError("");
      generateNodesAndEdges(parsed);
    } catch (err) {
      setError("Invalid JSON format");
      console.error("JSON parsing error:", err);
    }
  }, [templateText, generateNodesAndEdges]);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update styles when selection changes
  React.useEffect(() => {
    setNodes((currentNodes) =>
      updateNodeStyles(currentNodes, edges, selectedNode)
    );
    setEdges((currentEdges) => updateEdgeStyles(currentEdges, selectedNode));
  }, [selectedNode, updateNodeStyles, updateEdgeStyles, setNodes, setEdges]);

  // Initialize nodes and edges on mount
  React.useEffect(() => {
    generateNodesAndEdges(template);
  }, [generateNodesAndEdges, template]);

  return (
    <div className="h-screen flex">
      {/* Left Section - Template Editor */}
      <div className="w-1/2 p-4 border-r">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>ER Diagram Template Editor</CardTitle>
            <div className="flex gap-2">
              <Button onClick={updateTemplate} size="sm">
                Update Diagram
              </Button>
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>
          </CardHeader>
          <CardContent className="h-full pb-4">
            <textarea
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full h-full p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your ER diagram template JSON here..."
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Section - React Flow Diagram */}
      <div className="w-1/2 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>ER Diagram Visualization</CardTitle>
            {selectedNode && (
              <div className="text-sm text-blue-600 font-medium">
                Selected: {selectedNode} (Click background to deselect)
              </div>
            )}
          </CardHeader>
          <CardContent className="h-full pb-4">
            <div className="h-full border rounded-md">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
