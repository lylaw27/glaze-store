import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

interface CartValidateItem {
  productId: string;
  quantity: number;
}

interface CartValidateRequest {
  items: CartValidateItem[];
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
    const products = await fetchQuery(api.products.getByIds, {
      ids: productIds,
    });

    const validatedItems: ValidatedCartItem[] = [];
    let totalAmount = 0;
    const errors: string[] = [];

    for (const item of items) {
      // Only validate active products (matches the old `.eq("status", "active")`).
      const product = products.find(
        (p) => p.id === item.productId && p.status === "active"
      );

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

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || null,
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
