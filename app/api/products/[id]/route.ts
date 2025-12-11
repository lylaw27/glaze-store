import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/products/[id] - Get a single product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabaseAdmin
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
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Format categories, parse variants and addOns
    const productWithFormattedData = {
      ...product,
      categories: product.categories.map((pc: any) => pc.category.handle),
      images: JSON.parse(product.images),
      variants: product.variants && product.variants.length > 0
        ? { ...product.variants[0], options: JSON.parse(product.variants[0].options) }
        : null,
      addOns: product.addOns?.map((ao: any) => ({
        ...ao,
        addOnProduct: {
          ...ao.addOnProduct,
          images: JSON.parse(ao.addOnProduct.images),
        }
      })) || [],
    };

    return NextResponse.json(productWithFormattedData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
