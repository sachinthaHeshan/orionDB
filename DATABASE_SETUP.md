# Database Setup with Drizzle ORM

This project now uses Drizzle ORM with PostgreSQL for data persistence. Follow the steps below to set up your database.

## Prerequisites

- PostgreSQL database (local or cloud-hosted)
- Node.js and npm installed

## Environment Setup

1. **Create environment file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Add your PostgreSQL connection string to `.env.local`:**

   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database_name"
   ```

   Example with local PostgreSQL:

   ```bash
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myapp_db"
   ```

## Database Migration

1. **Generate migration files** (already done, but for future schema changes):

   ```bash
   npm run db:generate
   ```

2. **Run migrations to create tables:**

   ```bash
   npm run db:migrate
   ```

   Alternatively, you can push schema directly to the database:

   ```bash
   npm run db:push
   ```

3. **View your database with Drizzle Studio:**
   ```bash
   npm run db:studio
   ```

## Project Schema

The `projects` table has the following structure:

| Column      | Type      | Description                    |
| ----------- | --------- | ------------------------------ |
| id          | UUID      | Primary key (auto-generated)   |
| name        | VARCHAR   | Project name (max 100 chars)   |
| description | TEXT      | Project description (optional) |
| template    | JSON      | ER diagram template data       |
| created_at  | TIMESTAMP | Record creation time           |
| updated_at  | TIMESTAMP | Last update time               |
| is_default  | BOOLEAN   | Whether it's a default project |

## API Endpoints

### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "name": "My New Project",
  "description": "Optional description"
}
```

### Get All Projects

```http
GET /api/projects
```

## Using the Database

The database connection is established in `src/db/connection.ts` and the schema is defined in `src/db/schema.ts`.

### Example Usage in Code:

```typescript
import { db } from "@/db/connection";
import { projects } from "@/db/schema";

// Create a project
const newProject = await db
  .insert(projects)
  .values({
    name: "Test Project",
    description: "A test project",
    template: defaultTemplate,
  })
  .returning();

// Get all projects
const allProjects = await db.select().from(projects);
```

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Populate database with initial sample data

## Troubleshooting

1. **Connection Issues**: Verify your `DATABASE_URL` is correct
2. **Migration Errors**: Ensure your PostgreSQL server is running
3. **Permission Issues**: Make sure your database user has CREATE table permissions

## Next Steps

1. Set up your PostgreSQL database
2. Configure your `.env.local` file with your database connection string
3. Run migrations: `npm run db:migrate`
4. (Optional) Seed with sample data: `npm run db:seed`
5. Start your application: `npm run dev`
6. Test the API endpoints at `http://localhost:3000/api/projects`
