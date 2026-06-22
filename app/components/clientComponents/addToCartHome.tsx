'use client'

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/app/cartProvider"

interface AddToCartButtonProps {
    productId: string;
    name: string;
    price: number;
    image: string;
}

export default function AddToCartButton({ productId, name, price, image }: AddToCartButtonProps) {
    const { addToCart, setCartOpen } = useCart();

    const handleAddToCart = () => {
        addToCart({
            productId,
            name,
            price,
            quantity: 1,
            image,
        });
        setCartOpen(true);
    }

    return (
        <Button
            onClick={handleAddToCart}
            className="bg-background text-foreground hover:bg-background/90 px-6 h-11 text-xs tracking-[0.15em] uppercase rounded-none shadow-none transition-colors"
            size="sm"
        >
            <ShoppingCart className="w-4 h-4 mr-2" strokeWidth={1.25} />
            加入購物車
        </Button>
    )
}