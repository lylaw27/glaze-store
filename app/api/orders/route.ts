import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

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

interface ProductQueryResult {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string;
  status: string;
}

interface OrderItemInsertData {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
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

    // Get all products for the order items
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("Product")
      .select("id, name, price, stock, images, status")
      .in("id", productIds);

    if (productsError) {
      throw productsError;
    }

    // Validate all products exist and have sufficient stock
    for (const item of items) {
      const product = (products as ProductQueryResult[])?.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      const product = (products as ProductQueryResult[]).find((p) => p.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    // Create the order
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("Order")
      // @ts-expect-error - Supabase type generation issue
      .insert({
        customerName,
        customerEmail,
        customerAddress,
        paymentId: paymentId || null,
        totalAmount,
        status: "confirmed",
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      throw orderError || new Error("Failed to create order");
    }

    const orderId = (newOrder as { id: string }).id;

    // Create order items
    const orderItems: OrderItemInsertData[] = items.map((item) => {
      const product = (products as ProductQueryResult[]).find((p) => p.id === item.productId)!;
      return {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const { error: itemsError } = await supabaseAdmin
      .from("OrderItem")
      // @ts-expect-error - Supabase type generation issue
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Update stock for each product
    for (const item of items) {
      const product = (products as ProductQueryResult[]).find((p) => p.id === item.productId)!;
      const { error: stockError } = await supabaseAdmin
        .from("Product")
        // @ts-expect-error - Supabase type generation issue
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.productId);

      if (stockError) {
        throw stockError;
      }
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabaseAdmin
      .from("Order")
      .select(`
        *,
        items:OrderItem(
          *,
          product:Product(*)
        )
      `)
      .eq("id", orderId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
