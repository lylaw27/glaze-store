import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { adminSecret } from "@/lib/convex";

interface CategoryInsertData {
  name: string;
  handle: string;
  type: string;
}

// GET all categories
export async function GET() {
  try {
    const categories = await fetchQuery(api.categories.list, {});
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: Request) {
  try {
    const body: CategoryInsertData = await request.json();
    const { name, handle, type } = body;

    if (!name || !handle || !type) {
      return NextResponse.json(
        { error: "Name, handle, and type are required" },
        { status: 400 }
      );
    }

    try {
      const category = await fetchMutation(api.categories.create, {
        secret: adminSecret(),
        name,
        handle,
        type,
      });
      return NextResponse.json(category, { status: 201 });
    } catch (err) {
      if (err instanceof Error && err.message.includes("DUPLICATE")) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
