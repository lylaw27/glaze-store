import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface CartValidateItem {
  productId: string;
  quantity: number;
}

interface CartValidateRequest {
  items: CartValidateItem[];
}

interface ProductQueryResult {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  images: string;
}

interface ValidatedCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  itemTotal: number;
  availableStock: number;
}

interface CartValidateResponse {
  items: ValidatedCartItem[];
  totalAmount: number;
  errors?: string[];
  isValid: boolean;
}

// POST /api/cart/validate - Validate cart items and return pricing
export async function POST(request: Request) {
  try {
    const body: CartValidateRequest = await request.json();
    const { items } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("Product")
      .select("id, name, price, stock, status, images")
      .in("id", productIds)
      .eq("status", "active"); // Only validate active products

    if (productsError) {
      throw productsError;
    }

    const validatedItems: ValidatedCartItem[] = [];
    let totalAmount = 0;
    const errors: string[] = [];

    for (const item of items) {
      const product = (products as ProductQueryResult[])?.find((p: ProductQueryResult) => p.id === item.productId);

      if (!product) {
        errors.push(`Product not available: ${item.productId}`);
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

    const response: CartValidateResponse = {
      items: validatedItems,
      totalAmount,
      errors: errors.length > 0 ? errors : undefined,
      isValid: errors.length === 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      { error: "Failed to validate cart" },
      { status: 500 }
    );
  }
}
