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
    <h2 className="rounded-tl-md rounded-tr-md bg-secondary p-2 text-center text-sm text-muted-foreground">
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
};

export const DatabaseSchemaTableRow = ({
  children,
  className,
  entityName,
  attributeName,
  isPrimaryKey,
  isForeignKey,
}: DatabaseSchemaTableRowProps) => {
  const handleId = `${entityName}-${attributeName}`;

  return (
    <TableRow className={`relative text-xs ${className || ""}`}>
      {/* First cell with handles positioned absolutely */}
      <td className="relative">
        {/* Left handle for incoming connections */}
        {isForeignKey && (
          <BaseHandle
            type="target"
            position={Position.Left}
            id={`${handleId}-target`}
            className="!-left-2 !w-3 !h-3 !bg-green-500 !border-green-600 !absolute !top-1/2 !transform !-translate-y-1/2"
          />
        )}

        {/* Right handle for outgoing connections */}
        {isPrimaryKey && (
          <BaseHandle
            type="source"
            position={Position.Right}
            id={`${handleId}-source`}
            className="!-right-2 !w-3 !h-3 !bg-blue-500 !border-blue-600 !absolute !top-1/2 !transform !-translate-y-1/2"
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
