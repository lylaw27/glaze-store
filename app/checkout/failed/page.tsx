"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"

function CheckoutFailedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get("payment_intent")
  const errorMessage = searchParams.get("error_message")

  useEffect(() => {
    // If accessed directly without payment intent, redirect to home
    if (!paymentIntent) {
      router.push("/")
    }
  }, [paymentIntent, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            付款失敗
          </h1>
          
          <p className="text-gray-600">
            很抱歉，您的付款未能成功完成。
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">錯誤訊息</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">可能的原因</h2>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>信用卡資料輸入錯誤</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>信用卡額度不足</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>銀行拒絕交易</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>網絡連接問題</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">下一步怎麼做？</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• 檢查您的付款資料是否正確</li>
            <li>• 確認信用卡有足夠額度</li>
            <li>• 嘗試使用其他付款方式</li>
            <li>• 聯絡您的銀行確認交易狀態</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/checkout")}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            重新嘗試付款
          </Button>
          
          <Button
            onClick={() => router.push("/products")}
            variant="outline"
            className="w-full"
          >
            繼續購物
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="w-full"
          >
            返回首頁
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          如需協助，請聯絡我們的客戶服務團隊。
        </p>
      </div>
    </div>
  )
}

export default function CheckoutFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在載入...</p>
          </div>
        </div>
      }
    >
      <CheckoutFailedContent />
    </Suspense>
  )
}
