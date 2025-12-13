import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { StripePaymentIntentRequest, StripePaymentItem } from "@/types"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
})

export async function POST(req: NextRequest) {
  try {
    const { items, amount }: StripePaymentIntentRequest = await req.json()

    // Validate the amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "hkd",
      // Enable payment methods
      payment_method_types: [
        "card",
        "alipay",
        "wechat_pay",
      ],
      // Automatic payment methods includes Apple Pay, Google Pay, etc.
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
      metadata: {
        items: JSON.stringify(items.map((item: StripePaymentItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err) {
    console.error("Error creating payment intent:", err)
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
