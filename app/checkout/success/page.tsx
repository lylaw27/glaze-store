"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/app/cartProvider"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const paymentIntent = searchParams.get("payment_intent")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect to home if no payment intent
    if (!paymentIntent) {
      router.push("/")
      return
    }

    // Clear the cart after successful payment
    clearCart()

    // Fetch order details
    const fetchOrder = async () => {
      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const response = await fetch(`/api/orders?paymentId=${paymentIntent}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setOrder(data[0])
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [paymentIntent, router, clearCart])

  const fmt = (n: number) =>
    new Intl.NumberFormat("zh-HK", { 
      style: "currency", 
      currency: "HKD", 
      minimumFractionDigits: 2 
    }).format(n)

  if (!paymentIntent || loading) {
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
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            付款成功！
          </h1>
          
          <p className="text-gray-600">
            感謝您的購買。我們已收到您的訂單，並會盡快處理。
          </p>
        </div>

        {order && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">訂單詳情</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">訂單編號:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">訂單日期:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString("zh-HK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-sm font-semibold mb-3">商品清單</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-base font-semibold">總計:</span>
                <span className="text-base font-semibold">{fmt(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
        
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

        <p className="mt-6 text-sm text-gray-500 text-center">
          我們已發送確認電郵至您的信箱。
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在確認付款...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
