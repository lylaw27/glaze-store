import { supabaseAdmin } from "@/lib/supabase";
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

    let query = supabaseAdmin
      .from("Product")
      .select(`
        *,
        categories:ProductCategory(
          category:Category(*)
        ),
        variants:ProductVariant(*),
        addOns:ProductAddOn!ProductAddOn_mainProductId_fkey(
          id,
          addOnProduct:Product!ProductAddOn_addOnProductId_fkey(*)
        )
      `)
      .eq("status", "active")
      .gt("stock", 0);

    // Apply price range filters
    if (lowPrice) {
      query = query.gte("price", parseFloat(lowPrice));
    }
    if (highPrice) {
      query = query.lte("price", parseFloat(highPrice));
    }

    // Apply handle filter (for single product lookup)
    if (handle) {
      query = query.eq("handle", handle);
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
    type ProductQueryResult = {
      id: string;
      name: string;
      handle: string;
      description: string | null;
      price: number;
      stock: number;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      categories: Array<{ category: { handle: string } }>;
      variants: Array<{ id: string; productId: string; options: string; createdAt: Date; updatedAt: Date }> | null;
      addOns: Array<{ id: string; addOnProduct: Record<string, string | number | Date | null> }> | null;
      images: string;
    };
    
    let filteredProducts: ProductQueryResult[] = (products || []) as ProductQueryResult[];
    if (categories.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        product.categories.some((pc) =>
          categories.includes(pc.category.handle)
        )
      );
    }

    // Parse images from JSON string, format categories, and handle variants/addOns
    const productsWithParsedFields = filteredProducts.map((product) => {
      return {
        ...product,
        categories: product.categories.map((pc) => pc.category.handle),
        images: JSON.parse(product.images),
        variants: product.variants && product.variants.length > 0
          ? { ...product.variants[0], options: JSON.parse(product.variants[0].options) }
          : null,
        addOns: product.addOns?.map((ao) => {
          const addOnProduct = ao.addOnProduct as {
            id: string;
            name: string;
            handle: string;
            description: string | null;
            price: number;
            stock: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            images: string;
          };
          
          return {
            id: ao.id,
            mainProductId: product.id,
            addOnProductId: addOnProduct.id,
            createdAt: new Date(),
            addOnProduct: {
              ...addOnProduct,
              status: addOnProduct.status as 'active' | 'hidden',
              images: JSON.parse(addOnProduct.images),
            }
          };
        }) || [],
      };
    });

    return NextResponse.json(productsWithParsedFields);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
