import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/connection";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/projects/[id] - Get a single project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch project by ID from database
    const [projectData] = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId));

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: projectData,
      message: "Project retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project positions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Extract positions from request body
    const { positions, template, name, description } = body;

    // Build update object dynamically based on what's provided
    const updateData: {
      updatedAt: Date;
      positions?: Record<string, { x: number; y: number }>;
      template?: object;
      name?: string;
      description?: string;
    } = {
      updatedAt: new Date(),
    };

    if (positions !== undefined) {
      updateData.positions = positions;
    }
    if (template !== undefined) {
      updateData.template = template;
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    // Update project in database
    const [updatedProject] = await db
      .update(project)
      .set(updateData)
      .where(eq(project.id, projectId))
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
