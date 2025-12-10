import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface CartItem {
  productId: string;
  quantity: number;
}

// POST /api/cart/validate - Validate cart items and return pricing
export async function POST(request: Request) {
  try {
    const body: { items: CartItem[] } = await request.json();
    const { items } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("Product")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      throw productsError;
    }

    const validatedItems = [];
    let totalAmount = 0;
    const errors: string[] = [];

    for (const item of items) {
      const product = products?.find((p) => p.id === item.productId);

      if (!product) {
        errors.push(`Product not found: ${item.productId}`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
        continue;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      const images = JSON.parse(product.images);
      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: images[0] || null,
        itemTotal,
        availableStock: product.stock,
      });
    }

    return NextResponse.json({
      items: validatedItems,
      totalAmount,
      errors: errors.length > 0 ? errors : undefined,
      isValid: errors.length === 0,
    });
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      { error: "Failed to validate cart" },
      { status: 500 }
    );
  }
}
