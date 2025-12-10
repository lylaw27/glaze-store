import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/products/[id] - Get a single product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Format categories as array of names for backwards compatibility
    const productWithFormattedCategories = {
      ...product,
      categories: product.categories.map((pc) => pc.category.name),
    };

    return NextResponse.json(productWithFormattedCategories);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
