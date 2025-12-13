import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { ProductQueryResult, ProductWithRelations } from "@/types";

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

    const productData = product as ProductQueryResult;

    // Format categories, parse variants and addOns
    const productWithFormattedData: ProductWithRelations = {
      ...productData,
      categories: productData.categories.map((pc) => pc.category.handle),
      images: JSON.parse(productData.images),
      variants: productData.variants && productData.variants.length > 0
        ? { ...productData.variants[0], options: JSON.parse(productData.variants[0].options) }
        : null,
      addOns: productData.addOns?.map((ao) => ({
        id: ao.id,
        mainProductId: productData.id,
        addOnProductId: ao.addOnProduct.id,
        createdAt: new Date(),
        addOnProduct: {
          ...ao.addOnProduct,
          status: ao.addOnProduct.status as 'active' | 'hidden',
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
