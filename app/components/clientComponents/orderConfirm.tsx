"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, CreditCard,OctagonX } from "lucide-react"

type OrderItem = {
  id: string
  name: string
  image: string
  quantity: number
  price: number
  originalPrice?: number
  discount?: number
  note?: string
}

type OrderData = {
  id: string
  status: "confirmed" | "processing" | "shipped" | "delivered"
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  shipping_address?: {
    name: string
    company?: string
    address1: string
    address2?: string
    city: string
    province: string
    zip: string
    country: string
  }
  billingAddress: {
    name: string
    company?: string
    address1: string
    address2?: string
    city: string
    province: string
    zip: string
    country: string
  }
  shippingMethod: string
  paymentMethod: string
  estimatedDelivery: string
  trackingNumber?: string
}

// Mock order data - in real app this would come from API
const ORDERS: Record<string, OrderData> = {
  "WO-2024-001": {
    id: "WO-2024-001",
    status: "confirmed",
    items: [
      {
        id: "1",
        name: "KNIT石榴石U型耳環圈",
        image: "/images/product14-1.jpeg",
        quantity: 1,
        price: 1298,
      },
      {
        id: "2",
        name: "Wavy Heart 愛心月亮石925銀戒指",
        image: "/images/product11-1.jpeg",
        quantity: 1,
        price: 798,
        originalPrice: 898,
        discount: 100,
        note: "戒圍: US 7",
      },
      {
        id: "addon1",
        name: "加購120g碎白水晶｜淨化消磁",
        image: "/images/category2.jpeg",
        quantity: 2,
        price: 60,
        note: "購買手鏈x2",
      },
    ],
    subtotal: 2156,
    shipping: 0,
    tax: 0,
    discount: 100,
    total: 2056,
    currency: "HKD",
    shipping_address: {
      name: "陳小姐",
      address1: "銅鑼灣記利佐治街1號",
      address2: "時代廣場15樓A室",
      city: "香港",
      province: "香港島",
      zip: "",
      country: "香港",
    },
    billingAddress: {
      name: "陳小姐",
      address1: "銅鑼灣記利佐治街1號",
      address2: "時代廣場15樓A室",
      city: "香港",
      province: "香港島",
      zip: "",
      country: "香港",
    },
    shippingMethod: "順豐速運",
    paymentMethod: "信用卡 (**** 1234)",
    estimatedDelivery: "2024年1月15日 - 1月17日",
  },
}

const variantParser = (item) => {
    return item.variant?.options && item.variant?.options.map((option=>
        option.value != "Default option value" ?
        <div key={option.value} className="text-xs font-medium text-gray-700">{option.option?.title + ": " +option.value}</div>:
        <div key="none"/>
    ))
}

export default function OrderConfirmation({ orderObj }: { orderObj }) {
    const order = ORDERS["WO-2024-001"]
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
        new Intl.NumberFormat("zh-HK", { style: "currency", currency: order.currency, minimumFractionDigits: 2 }).format(n)

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
          {!orderObj.fulfillment_status || orderObj.fulfillment_status === "not_fulfilled" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Package className="h-4 w-4 mr-1" />
              處理中
            </span>
          )}
          {orderObj.fulfillment_status === "fulfilled" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              已確認
            </span>
          )}
          {orderObj.fulfillment_status === "shipped" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              <Truck className="h-4 w-4 mr-1" />
              已發貨
            </span>
          )}
          {orderObj.fulfillment_status === "delivered" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              已送達
            </span>
          )}
        {orderObj.fulfillment_status === "canceled" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <OctagonX className="h-4 w-4 mr-1" />
              訂單已取消
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">預計送達</p>
              <p className="text-gray-600">{order.estimatedDelivery}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">運送方式</p>
              <p className="text-gray-600">{order.shippingMethod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">付款方式</p>
              <p className="text-gray-600">{orderObj.payment_method}</p>
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
              {orderObj.items && orderObj.items.map((item) => (
                <div key={`${item.id}-${item.title || ""}`} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={item.product?.thumbnail || "/placeholder.svg?height=80&width=80&query=product"}
                      alt={item.product?.title || "Product Image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product?.title}</h4>
                    {/* {item.note && <p className="text-xs text-gray-600 mt-1">{item.note}</p>} */}
                    {variantParser(item)}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">數量: {item.quantity}</p>
                      <div className="text-right">
                        {item.original_total && item.original_total > item.total && (
                          <p className="text-xs text-gray-500 line-through">
                            {currency(item.original_total * item.quantity)}
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-900">{currency(item.total * item.quantity)}</p>
                      </div>
                    </div>
                    {item.discount_total != 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          折扣 -{currency(item.discount_total * item.quantity)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">小計</span>
                <span className="text-gray-900">{currency(orderObj.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">運費</span>
                <span className="text-gray-900">{orderObj.shipping_total === 0 ? "免費" : currency(order.shipping_total)}</span>
              </div>
              {orderObj.discount_total > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>折扣</span>
                  <span>-{currency(orderObj.discount_total)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">總計</span>
                  <span className="text-lg font-semibold text-gray-900">{currency(orderObj.total)}</span>
                </div>
                {orderObj.discount_total > 0 && (
                  <p className="text-sm text-green-600 text-right mt-1">您節省了 {currency(orderObj.discount_total)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">送貨地址</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{orderObj.shipping_address?.first_name} {orderObj.shipping_address?.last_name}</p>
              <p>{orderObj.shipping_address?.address_1}</p>
              {orderObj.shipping_address?.address_2 && <p>{orderObj.shipping_address?.address_2}</p>}
              <p>
                {orderObj.shipping_address?.province}, {orderObj.shipping_address?.city}
              </p>
              {/* <p>{orderObj.shipping_address?.country}</p> */}
            </div>
          </div>

          {/* Billing Address */}
          {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">帳單地址</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{order.billingAddress.name}</p>
              {order.billingAddress.company && <p>{order.billingAddress.company}</p>}
              <p>{order.billingAddress.address1}</p>
              {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
              <p>
                {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.zip}
              </p>
              <p>{order.billingAddress.country}</p>
            </div>
          </div> */}

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
