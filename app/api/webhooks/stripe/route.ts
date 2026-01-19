import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`PaymentIntent for ${JSON.stringify(paymentIntent, null, 2)} succeeded.`);
    try {
      // Extract items and customer info from metadata
      const items = JSON.parse(paymentIntent.metadata.items || "[]");
      const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata.email;
      const customerName = paymentIntent.metadata.customerName || paymentIntent.shipping?.name || "Customer";
      const shippingAddress = paymentIntent.shipping?.address 
        ? `${paymentIntent.shipping.address.line1}, ${paymentIntent.shipping.address.city}, ${paymentIntent.shipping.address.postal_code}${paymentIntent.shipping.address.country ? ', ' + paymentIntent.shipping.address.country : ''}`
        : paymentIntent.metadata.customerAddress || "No address provided";

      if (!items.length) {
        console.error("No items found in payment intent metadata");
        return NextResponse.json({ received: true });
      }

      // Get all products for the order items
      const productIds = items.map((item: any) => item.productId);
      const { data: products, error: productsError } = await supabaseAdmin
        .from("Product")
        .select("id, name, price, stock, images, status")
        .in("id", productIds);

      if (productsError) {
        throw productsError;
      }

      if (!products || products.length === 0) {
        console.error("Products not found for order");
        return NextResponse.json({ received: true });
      }

      // Calculate total amount (convert from cents to HKD)
      const totalAmount = paymentIntent.amount / 100;

      // Generate order ID
      const orderId = uuidv4();
      const now = new Date().toISOString();

      // Create the order
      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from("Order")
        .insert({
          id: orderId,
          customerName,
          customerEmail: customerEmail || "unknown@example.com",
          customerAddress: shippingAddress,
          paymentId: paymentIntent.id,
          totalAmount,
          status: "confirmed",
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (orderError || !newOrder) {
        throw orderError || new Error("Failed to create order");
      }

      // Create order items
      const orderItems = items.map((item: any) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          id: uuidv4(),
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price || item.price,
        };
      });

      const { error: itemsError } = await supabaseAdmin
        .from("OrderItem")
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // Update stock for each product
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const { error: stockError } = await supabaseAdmin
            .from("Product")
            .update({ stock: product.stock - item.quantity })
            .eq("id", item.productId);

          if (stockError) {
            console.error("Error updating stock:", stockError);
          }
        }
      }

      // Fetch the complete order with items for email
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
        console.error("Error fetching complete order:", fetchError);
      }

      // Send confirmation email
      if (customerEmail && completeOrder) {
        try {
          await sendOrderConfirmationEmail(
            customerEmail,
            customerName,
            completeOrder
          );
          console.log(`Confirmation email sent to ${customerEmail}`);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }
      }

      console.log(`Order ${orderId} created successfully for payment ${paymentIntent.id}`);
    } catch (error) {
      console.error("Error processing payment intent:", error);
      // Return 200 to acknowledge receipt even if processing failed
      // Stripe will retry failed webhooks
      return NextResponse.json({ 
        received: true, 
        error: "Processing failed, will retry" 
      });
    }
  }

  return NextResponse.json({ received: true });
}
