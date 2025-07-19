import { NextRequest, NextResponse } from "next/server";
import { CreateProjectData } from "@/types/project";
import { ERTemplate } from "@/types/er-diagram";
import defaultTemplate from "@/data/defaultTemplate.json";
import { db } from "@/db/connection";
import { project, insertProjectSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/projects - Create a new project (requires name, description, and type)
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectData = await request.json();

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "Project name and type are required" },
        { status: 400 }
      );
    }

    if (!["manual", "import"].includes(body.type)) {
      return NextResponse.json(
        { error: "Project type must be either 'manual' or 'import'" },
        { status: 400 }
      );
    }

    // Log project type for future implementation
    console.log(`Creating project of type: ${body.type}`);

    // For now, handle both types the same way
    // TODO: Implement database import functionality for type 'import'
    if (body.type === "import") {
      // In the future, this will handle database connection and schema import
      console.log("Database import functionality will be implemented here");
    }

    // Validate input using Zod schema
    const validationResult = insertProjectSchema.safeParse({
      name: body.name,
      description: body.description || "",
      type: body.type,
      template: defaultTemplate as ERTemplate,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    // Insert project into database
    const [newProject] = await db
      .insert(project)
      .values({
        name: body.name.trim(),
        description: body.description?.trim() || "",
        type: body.type,
        template: defaultTemplate as ERTemplate,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newProject,
        message: `Project created successfully ${
          body.type === "manual" ? "manually" : "for database import"
        }`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/projects - Get all projects
export async function GET() {
  try {
    // Fetch all projects from database
    const allProjects = await db.select().from(project);

    return NextResponse.json({
      success: true,
      data: allProjects,
      message: "Projects retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/projects - Update a project
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, template } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Update project in database
    const [updatedProject] = await db
      .update(project)
      .set({
        name: name.trim(),
        description: description?.trim() || "",
        template: template || (defaultTemplate as ERTemplate),
        updatedAt: new Date(),
      })
      .where(eq(project.id, id))
      .returning();

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects - Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Delete project from database
    const [deletedProject] = await db
      .delete(project)
      .where(eq(project.id, id))
      .returning();

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deletedProject,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
