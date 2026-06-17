import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { adminSecret } from "@/lib/convex";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  paymentId?: string;
  items: OrderItemInput[];
}

// POST /api/orders - Create a new order (after payment confirmation)
export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    const { customerName, customerEmail, customerAddress, paymentId, items } =
      body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerAddress || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    try {
      // Validation (existence + stock), order/items insert and stock decrement all
      // happen atomically inside the Convex mutation.
      const completeOrder = await fetchMutation(api.orders.create, {
        secret: adminSecret(),
        customerName,
        customerEmail,
        customerAddress,
        paymentId: paymentId || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      return NextResponse.json(completeOrder, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const notFound = message.match(/PRODUCT_NOT_FOUND:(.+)/);
      if (notFound) {
        return NextResponse.json(
          { error: `Product not found: ${notFound[1]}` },
          { status: 400 }
        );
      }
      const lowStock = message.match(/INSUFFICIENT_STOCK:(.+)/);
      if (lowStock) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${lowStock[1]}` },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get orders (optionally filter by paymentId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    const orders = await fetchQuery(api.orders.list, {
      paymentId: paymentId ?? undefined,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
