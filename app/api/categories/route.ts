import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET all categories
export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("Category")
      .select(`
        *,
        products:ProductCategory(count)
      `)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    // Format to match expected structure
    const formattedCategories = categories?.map((cat: any) => ({
      ...cat,
      _count: {
        products: cat.products?.length || 0,
      },
    }));

    return NextResponse.json(formattedCategories);
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
    const body = await request.json();
    const { name, handle, type } = body;

    if (!name || !handle || !type) {
      return NextResponse.json(
        { error: "Name, handle, and type are required" },
        { status: 400 }
      );
    }

    const { data: category, error } = await supabaseAdmin
      .from("Category")
      .insert({
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        type: type.trim(),
      })
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
      throw error;
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
