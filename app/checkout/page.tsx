"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useCart } from "@/app/cartProvider"
import CheckoutForm from "./CheckoutForm"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getCartTotal } = useCart()
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart.items || cart.items.length === 0) {
      router.push("/")
      return
    }

    // Create PaymentIntent as soon as the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.items,
        amount: getCartTotal(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error)
        setLoading(false)
      })
  }, [cart, getCartTotal, router])

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在準備結賬...</p>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">無法初始化付款，請重試。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-semibold mb-8">結賬</h1>
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  )
}
