"use client"

import { 
  CardElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useEffect, useState } from "react"
import { sdk } from "@lib/config";
import { useCart } from "app/cartProvider";
import { create } from "lodash";
import { createPaymentSession } from "app/[countryCode]/(checkout)/fetch";
import { retrieveCart } from "@lib/data/cart";
import { Button } from "@/components/ui/button"
import Payment from "@modules/checkout/components/payment";

const stripe = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY || "temp"
)

export default function StripePayment() {
  const { cart,setCart,refreshCart } = useCart()
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined)
  const [activeSession, setActiveSession] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  // const elements = useElements()
  // const stripeX = useStripe()


  // let clientSecret = ""
  console.log(cart)

  useEffect(() => {
    if(!cart.id || activeSession) return
    createPaymentSession(cart)
      .then((payment_collection) => {
        console.log(payment_collection)
      })
      .then((payment_collection) => 
        retrieveCart(cart.id)
      )
      .then((updatedCart) => {
        console.log(updatedCart)
        if(updatedCart){
          setCart(updatedCart)
          setClientSecret(updatedCart?.payment_collection?.payment_sessions?.[0].data.client_secret as string)
          setActiveSession(true)
          // clientSecret = updatedCart?.payment_collection?.payment_sessions?.[0].data.client_secret as string
        }
    })
  }, [cart])

  return (
    <div>
    {/* {
      activeSession && (
        <Elements stripe={stripe} options={{
            clientSecret,
          }}>
          <PaymentElement
            // onChange={handlePaymentElementChange}
            options={{
              layout: "accordion",
            }}
            />
            <Button onClick={handlePayment} disabled={loading} className="w-full bg-black text-white py-4 text-base font-medium hover:bg-black/90">
              立即付款
            </Button>
        </Elements>
      )
    } */}
    { 
      activeSession && (

      <Elements stripe={stripe} options={{
        clientSecret,
      }}>
      <StripeForm clientSecret={clientSecret} />
    </Elements>
    )}
    </div> 
  )
}

const StripeForm = ({ 
  clientSecret,
}: {
  clientSecret: string | undefined
}) => {
  const { cart, refreshCart } = useCart()
  const [loading, setLoading] = useState(false)

  const stripe = useStripe()
  const elements = useElements()

    const availablePaymentMethods = [
        {
            "id": "pp_stripe_stripe",
            "is_enabled": true
        }
    ]

  return (
    // <form>
    //   <CardElement />
    //   <button 
    //     // onClick={handlePayment}
    //     disabled={loading}
    //   >
    //     Place Order
    //   </button>
    // </form>
    <div>
      <Payment cart={cart} />
    </div>
  )
}