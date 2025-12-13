"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, CreditCard, OctagonX } from "lucide-react"
import type { OrderWithItems } from "@/types"

interface OrderConfirmationProps {
  orderObj: OrderWithItems | null;
}

export default function OrderConfirmation({ orderObj }: OrderConfirmationProps) {
    if (!orderObj) {
        return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">訂單未找到</h1>
            <p className="text-gray-600 mb-6">請檢查您的訂單號碼是否正確</p>
            <Link href="/" className="text-blue-600 hover:underline">
            返回首頁
            </Link>
        </div>
        )
    }

    const currency = (n: number) =>
        new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

  return (
    <div>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="grid grid-cols-3 mb-8">
        <div className="col-start-2 col-end-3 place-self-center">
          {/* <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">White on</h1>
            <p className="text-sm text-gray-600">感謝您的購買！</p>
          </div> */}
            <Image width={120} height={120} src="/images/glaze-logo-dark.png" alt="Glaze Logo"/>
        </div>
        <div className="text-right col-start-3 col-end-4 place-self-end">
          <p className="text-sm text-gray-600">訂單編號</p>
          <p className="text-lg font-semibold text-gray-900">#{orderObj.id.slice(6,13)}</p>
        </div>
      </div>

      {/* Thank you message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">感謝您的購買！</h2>
        <p className="text-gray-700 mb-4">我們正在準備您的訂單以便發貨。當訂單發出時，我們會通知您。</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href={`/orders/${orderObj.id}`}>查看訂單詳情</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">繼續購物</Link>
          </Button>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">訂單狀態</h3>
          {orderObj.status === "confirmed" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              已確認
            </span>
          )}
          {orderObj.status === "processing" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Package className="h-4 w-4 mr-1" />
              處理中
            </span>
          )}
          {orderObj.status === "shipped" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              <Truck className="h-4 w-4 mr-1" />
              已發貨
            </span>
          )}
          {orderObj.status === "delivered" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              已送達
            </span>
          )}
          {orderObj.status === "cancelled" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <OctagonX className="h-4 w-4 mr-1" />
              訂單已取消
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">訂單編號</p>
              <p className="text-gray-600">#{orderObj.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">付款編號</p>
              <p className="text-gray-600">{orderObj.paymentId || "未提供"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">訂單摘要</h3>

            <div className="space-y-6">
              {orderObj.items && orderObj.items.map((item) => {
                const images = JSON.parse(item.product?.images || "[]");
                const thumbnail = images[0] || "/placeholder.svg?height=80&width=80&query=product";
                
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={thumbnail}
                        alt={item.product?.name || "Product Image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product?.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">數量: {item.quantity}</p>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{currency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order totals */}
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">總計</span>
                  <span className="text-lg font-semibold text-gray-900">{currency(orderObj.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">客戶資料</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <p className="font-medium text-gray-900">姓名</p>
                <p>{orderObj.customerName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">電郵</p>
                <p>{orderObj.customerEmail}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">送貨地址</p>
                <p>{orderObj.customerAddress}</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">需要幫助？</h3>
            <p className="text-sm text-gray-600 mb-4">如有任何問題，請隨時聯繫我們的客服團隊。</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">電話：</span>
                <Link href="tel:34819899" className="text-blue-600 hover:underline">
                  3481 9899
                </Link>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">營業時間：</span>
                星期一至日 12:00-20:30
              </p>
              <p className="text-gray-700">
                <span className="font-medium">門市地址：</span>
                香港銅鑼灣記利佐治街Fashion Walk 1樓K4&K10
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
