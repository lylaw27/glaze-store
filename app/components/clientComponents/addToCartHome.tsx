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
            className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
            size="sm"
        > 
            <ShoppingCart className="w-4 h-4 mr-2" />
            加入購物車
        </Button>
    )
}