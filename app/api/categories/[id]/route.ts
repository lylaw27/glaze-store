import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { adminSecret } from "@/lib/convex";
import type { Id } from "@/convex/_generated/dataModel";

interface CategoryUpdateData {
  name: string;
  handle: string;
  type: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE category by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    try {
      await fetchMutation(api.categories.remove, {
        secret: adminSecret(),
        id: id as Id<"categories">,
      });
      return NextResponse.json({ message: "Category deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("NOT_FOUND")) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      const inUse = message.match(/IN_USE:(\d+)/);
      if (inUse) {
        return NextResponse.json(
          { error: `Cannot delete category. It is used by ${inUse[1]} product(s)` },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

// PUT update category by ID
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: CategoryUpdateData = await request.json();
    const { name, handle, type } = body;

    if (!name || !handle || !type) {
      return NextResponse.json(
        { error: "Name, handle, and type are required" },
        { status: 400 }
      );
    }

    try {
      const category = await fetchMutation(api.categories.update, {
        secret: adminSecret(),
        id: id as Id<"categories">,
        name,
        handle,
        type,
      });
      return NextResponse.json(category);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("DUPLICATE")) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
      if (message.includes("NOT_FOUND")) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}
