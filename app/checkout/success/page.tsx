"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/app/cartProvider"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const paymentIntent = searchParams.get("payment_intent")

  useEffect(() => {
    // Redirect to home if no payment intent
    if (!paymentIntent) {
      router.push("/")
    }
  }, [paymentIntent, router])

  useEffect(() => {
    // Clear the cart after successful payment
    if (paymentIntent) {
      clearCart()
    }
  }, [paymentIntent, clearCart])

  if (!paymentIntent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在確認付款...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          付款成功！
        </h1>
        
        <p className="text-gray-600 mb-8">
          感謝您的購買。我們已收到您的訂單，並會盡快處理。
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            返回首頁
          </Button>
          
          <Button
            onClick={() => router.push("/products")}
            variant="outline"
            className="w-full"
          >
            繼續購物
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          我們已發送確認電郵至您的信箱。
        </p>
      </div>
    </div>
  )
}
