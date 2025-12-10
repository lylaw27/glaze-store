import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/products - Get all products (for storefront)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
        ...(category && {
          categories: {
            some: {
              category: {
                name: { contains: category },
              },
            },
          },
        }),
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) }),
    });

    // Parse images from JSON string and format categories
    const productsWithParsedFields = products.map((product) => ({
      ...product,
      categories: product.categories.map((pc) => pc.category.name),
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
