import { ParsedField, ERTemplate } from "@/types/er-diagram";

// Helper function to parse field definition
export const parseFieldDefinition = (
  definition: string,
  template?: ERTemplate,
  entityName?: string,
  fieldName?: string
): ParsedField => {
  const parts = definition.toLowerCase().split(/\s+/);

  // Check if this field is a foreign key by looking at relations
  let isForeignKey = parts.includes("foreign-key");

  if (template && entityName && fieldName && !isForeignKey) {
    // Check if this field is referenced in any relation as a "to" field
    isForeignKey = template.relations.some((relation) => {
      const [toEntity, toField] = relation.to.split(".");
      return toEntity === entityName && toField === fieldName;
    });
  }

  return {
    type: parts[0] || "varchar",
    primaryKey: parts.includes("primary-key"),
    foreignKey: isForeignKey,
    nullable: !parts.includes("not-null"),
    unique: parts.includes("unique"),
  };
};
