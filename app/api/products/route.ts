import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/products - Get all products (for storefront)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    let query = supabaseAdmin
      .from("Product")
      .select(`
        *,
        categories:ProductCategory(
          category:Category(*)
        )
      `)
      .gt("stock", 0)
      .order("createdAt", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    // Filter by category if specified and format response
    let filteredProducts = products || [];
    if (category) {
      filteredProducts = filteredProducts.filter((product: any) =>
        product.categories.some((pc: any) =>
          pc.category.name.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Parse images from JSON string and format categories
    const productsWithParsedFields = filteredProducts.map((product: any) => ({
      ...product,
      categories: product.categories.map((pc: any) => pc.category.name),
      images: JSON.parse(product.images),
    }));

    return NextResponse.json(productsWithParsedFields);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
