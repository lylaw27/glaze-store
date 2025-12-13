import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface CategoryUpdateData {
  name: string;
  handle: string;
  type: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CategoryWithProducts {
  id: string;
  name: string;
  handle: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  products?: Array<{ count: number }>;
}

// DELETE category by ID
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Check if category exists and count products
    const { data: category, error: fetchError } = await supabaseAdmin
      .from("Category")
      .select(`
        *,
        products:ProductCategory(count)
      `)
      .eq("id", id)
      .single();

    if (fetchError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used by any products
    const productCount = (category as CategoryWithProducts).products?.[0]?.count || 0;
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is used by ${productCount} product(s)` },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("Category")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

// PUT update category by ID
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
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

    const { data: category, error } = await supabaseAdmin
      .from("Category")
      // @ts-expect-error - Supabase type generation issue
      .update({
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        type: type.trim(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
      // Handle record not found
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}
