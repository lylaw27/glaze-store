import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { adminSecret } from "@/lib/convex";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Type for items stored in payment intent metadata
interface PaymentIntentItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

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
      const items: PaymentIntentItem[] = JSON.parse(paymentIntent.metadata.items || "[]");
      const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata.email;
      const customerName = paymentIntent.metadata.customerName || paymentIntent.shipping?.name || "Customer";
      const shippingAddress = paymentIntent.shipping?.address
        ? `${paymentIntent.shipping.address.line1}, ${paymentIntent.shipping.address.city}, ${paymentIntent.shipping.address.postal_code}${paymentIntent.shipping.address.country ? ', ' + paymentIntent.shipping.address.country : ''}`
        : paymentIntent.metadata.customerAddress || "No address provided";

      if (!items.length) {
        console.error("No items found in payment intent metadata");
        return NextResponse.json({ received: true });
      }

      // Create the order, order items and stock decrement atomically, returning the
      // complete order (with items + products) for the confirmation email.
      const completeOrder = await fetchMutation(api.orders.createFromPayment, {
        secret: adminSecret(),
        customerName,
        customerEmail: customerEmail || "unknown@example.com",
        customerAddress: shippingAddress,
        paymentId: paymentIntent.id,
        totalAmount: paymentIntent.amount / 100, // cents -> HKD
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Send confirmation email
      if (customerEmail && completeOrder) {
        try {
          const emailResult = await sendOrderConfirmationEmail(
            customerEmail,
            customerName,
            completeOrder
          );
          if (emailResult) {
            console.log(`Confirmation email sent to ${customerEmail}`);
          }
          console.log(emailResult);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }
      }

      console.log(`Order ${completeOrder.id} created successfully for payment ${paymentIntent.id}`);
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
