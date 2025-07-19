import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Project table schema
export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description").default(""),
  type: varchar("type", { length: 20 }).notNull().default("manual"), // Project type: manual or import
  template: json("template").notNull(), // Store ER template as JSON
  positions: json("positions").default({}), // Store table positions as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDefault: boolean("is_default").default(false),
});

// Zod schemas for validation
export const insertProjectSchema = createInsertSchema(project, {
  name: (schema) =>
    schema
      .min(1, "Project name is required")
      .max(50, "Project name must be 50 characters or less"),
  description: (schema) =>
    schema.max(200, "Description must be 200 characters or less"),
  type: (schema) =>
    schema.refine(
      (value) => ["manual", "import"].includes(value),
      "Project type must be either 'manual' or 'import'"
    ),
});

export const selectProjectSchema = createSelectSchema(project);

// TypeScript types
export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
