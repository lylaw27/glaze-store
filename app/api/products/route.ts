import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

// GET /api/products - Get all products (for storefront)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const handle = searchParams.get("handle");
    const categories = searchParams.getAll("category"); // Get all category params
    const sort = searchParams.get("sort");
    const lowPrice = searchParams.get("lowPrice");
    const highPrice = searchParams.get("highPrice");

    // Filtering, sorting and relation shaping all happen inside the Convex query.
    const products = await fetchQuery(api.products.list, {
      limit: limit ? parseInt(limit) : undefined,
      search: search ?? undefined,
      handle: handle ?? undefined,
      categories: categories.length > 0 ? categories : undefined,
      sort: sort ?? undefined,
      lowPrice: lowPrice ? parseFloat(lowPrice) : undefined,
      highPrice: highPrice ? parseFloat(highPrice) : undefined,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
