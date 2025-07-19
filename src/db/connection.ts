import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
const client = postgres(connectionString, {
  max: 1, // Limit connections for serverless environments
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type DB = typeof db;
