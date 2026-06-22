"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { useCart } from "@/app/cartProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { cart, getCartTotal, clearCart } = useCart()

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage("")

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email,
      },
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "付款失敗")
      } else {
        setMessage("發生意外錯誤")
      }
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Order Summary */}
      <div className="bg-muted p-6">
        <h2 className="font-serif text-lg font-normal mb-4">訂單摘要</h2>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border bg-background">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base text-foreground truncate">{item.name}</p>
                {item.variants && Object.keys(item.variants).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(item.variants).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {value}
                      </span>
                    ))}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">數量: {item.quantity}</p>
              </div>
              <div className="text-sm text-foreground">
                {fmt(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-base">
            <span className="tracking-wide">總計</span>
            <span className="font-serif text-lg">{fmt(getCartTotal())}</span>
          </div>
        </div>
      </div>

      {/* Customer Email */}
      <div>
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email)}
        />
      </div>

      {/* Express Checkout - Apple Pay & Google Pay */}
      <div>
        <ExpressCheckoutElement
          onConfirm={async (event) => {
            if (!stripe || !elements) {
              return
            }

            setIsLoading(true)
            
            const { error: submitError } = await elements.submit()
            if (submitError) {
              setMessage(submitError.message || "付款失敗")
              setIsLoading(false)
              return
            }

            const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
                receipt_email: email,
              },
            })

            if (error) {
              setMessage(error.message || "付款失敗")
              setIsLoading(false)
            }
          }}
          options={{
            buttonType: {
              applePay: 'buy',
              googlePay: 'buy',
            },
          }}
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground">或使用其他付款方式</span>
        </div>
      </div>

      {/* Payment Method - includes Express Checkout (Apple Pay, Google Pay) */}
      <div>
        <h2 className="font-serif text-lg font-normal mb-4">付款方式</h2>
        <PaymentElement
          options={{
            layout: "accordion",
            paymentMethodOrder: ['alipay', 'wechat_pay', 'card'],
          }}
        />
      </div>

      {/* Shipping Address */}
      <div>
        <h2 className="font-serif text-lg font-normal mb-4">送貨地址</h2>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["HK", "CN"],
            defaultValues: {
              address: {
                country: "HK",
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {message && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-xs tracking-[0.2em] uppercase rounded-none shadow-none"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
            <span>處理中...</span>
          </div>
        ) : (
          `立即付款 ${fmt(getCartTotal())}`
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        點擊「立即付款」即表示您同意我們的條款和條件
      </p>
    </form>
  )
}
