import React, { ReactNode } from "react";
import { Position } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { BaseHandle } from "@/components/base-handle";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";

/* DATABASE SCHEMA NODE HEADER ------------------------------------------------ */
/**
 * A container for the database schema node header.
 */
export type DatabaseSchemaNodeHeaderProps = {
  children?: ReactNode;
};

export const DatabaseSchemaNodeHeader = ({
  children,
}: DatabaseSchemaNodeHeaderProps) => {
  return (
    <h2 className="rounded-tl-md rounded-tr-md bg-blue-50 dark:bg-blue-900 p-2 text-center text-sm font-semibold text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-700">
      {children}
    </h2>
  );
};

/* DATABASE SCHEMA NODE BODY -------------------------------------------------- */
/**
 * A container for the database schema node body that wraps the table.
 */
export type DatabaseSchemaNodeBodyProps = {
  children?: ReactNode;
};

export const DatabaseSchemaNodeBody = ({
  children,
}: DatabaseSchemaNodeBodyProps) => {
  return (
    <table className="border-spacing-10 overflow-visible">
      <TableBody>{children}</TableBody>
    </table>
  );
};

/* DATABASE SCHEMA TABLE ROW -------------------------------------------------- */
/**
 * A wrapper for individual table rows in the database schema node.
 */

export type DatabaseSchemaTableRowProps = {
  children: ReactNode;
  className?: string;
  entityName?: string;
  attributeName?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
};

export const DatabaseSchemaTableRow = ({
  children,
  className,
  entityName,
  attributeName,
  isPrimaryKey,
  isForeignKey,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  showSourceHandle = true,
  showTargetHandle = true,
}: DatabaseSchemaTableRowProps) => {
  const handleId = `${entityName}-${attributeName}`;

  // Position-based styling for handles
  const getHandlePositionStyle = (position: Position) => {
    const baseStyle = "!w-3 !h-3 !absolute";
    switch (position) {
      case Position.Left:
        return `${baseStyle} !-left-2 !top-1/2 !transform !-translate-y-1/2`;
      case Position.Right:
        return `${baseStyle} !-right-2 !top-1/2 !transform !-translate-y-1/2`;
      default:
        return `${baseStyle} !-right-2 !top-1/2 !transform !-translate-y-1/2`;
    }
  };

  return (
    <TableRow className={`relative text-xs ${className || ""}`}>
      {/* First cell with handles positioned absolutely */}
      <td className="relative">
        {/* Target handle for incoming connections */}
        {isForeignKey && showTargetHandle && (
          <BaseHandle
            type="target"
            position={targetPosition}
            id={`${handleId}-target`}
            className={`${getHandlePositionStyle(
              targetPosition
            )} !bg-green-500 !border-green-600`}
          />
        )}

        {/* Source handle for outgoing connections */}
        {isPrimaryKey && showSourceHandle && (
          <BaseHandle
            type="source"
            position={sourcePosition}
            id={`${handleId}-source`}
            className={`${getHandlePositionStyle(
              sourcePosition
            )} !bg-blue-500 !border-blue-600`}
          />
        )}
      </td>
      {children}
    </TableRow>
  );
};

/* DATABASE SCHEMA TABLE CELL ------------------------------------------------- */
/**
 * A simplified table cell for the database schema node.
 * Renders static content without additional dynamic props.
 */
export type DatabaseSchemaTableCellProps = {
  className?: string;
  children?: ReactNode;
};

export const DatabaseSchemaTableCell = ({
  className,
  children,
}: DatabaseSchemaTableCellProps) => {
  return <TableCell className={className}>{children}</TableCell>;
};

/* DATABASE SCHEMA NODE ------------------------------------------------------- */
/**
 * The main DatabaseSchemaNode component that wraps the header and body.
 * It maps over the provided schema data to render rows and cells.
 */
export type DatabaseSchemaNodeProps = {
  className?: string;
  selected?: boolean;
  children?: ReactNode;
};

export const DatabaseSchemaNode = ({
  className,
  selected,
  children,
}: DatabaseSchemaNodeProps) => {
  return (
    <BaseNode className={className} selected={selected}>
      {children}
    </BaseNode>
  );
};
