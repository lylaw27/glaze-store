import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/orders/[id] - Get a single order by ID (for order confirmation/tracking)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabaseAdmin
      .from("Order")
      .select(`
        *,
        items:OrderItem(
          *,
          product:Product(
            id,
            name,
            images
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
