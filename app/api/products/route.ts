import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/products - Get all products (for storefront)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const categories = searchParams.getAll("category"); // Get all category params
    const sort = searchParams.get("sort");
    const lowPrice = searchParams.get("lowPrice");
    const highPrice = searchParams.get("highPrice");

    let query = supabaseAdmin
      .from("Product")
      .select(`
        *,
        categories:ProductCategory(
          category:Category(*)
        )
      `)
      .gt("stock", 0);

    // Apply price range filters
    if (lowPrice) {
      query = query.gte("price", parseFloat(lowPrice));
    }
    if (highPrice) {
      query = query.lte("price", parseFloat(highPrice));
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    if (sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else {
      // Default sort by creation date
      query = query.order("createdAt", { ascending: false });
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    // Filter by categories if specified (client-side for multiple categories due to join complexity)
    type ProductWithCategories = {
      categories: Array<{ category: { handle: string } }>;
      images: string;
      [key: string]: unknown;
    };
    
    let filteredProducts: ProductWithCategories[] = (products || []) as ProductWithCategories[];
    if (categories.length > 0) {
      filteredProducts = filteredProducts.filter((product: ProductWithCategories) =>
        product.categories.some((pc) =>
          categories.includes(pc.category.handle)
        )
      );
    }

    // Parse images from JSON string and format categories
    const productsWithParsedFields = filteredProducts.map((product: ProductWithCategories) => ({
      ...product,
      categories: product.categories.map((pc) => pc.category.handle),
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
