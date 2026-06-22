'use client'

import { Button } from "@/components/ui/button"
import { useCart } from "@/app/cartProvider"

interface AddToCartButtonProps {
    productId: string;
    name: string;
    price: number;
    image: string;
    text: string;
    quantity: number;
    disabled?: boolean;
    variants?: Record<string, string>;
    addOns?: Array<{
        productId: string;
        name: string;
        price: number;
        image: string;
    }>;
}

export default function AddToCartButton({ 
    productId, 
    name, 
    price, 
    image, 
    text, 
    quantity,
    disabled = false,
    variants,
    addOns = []
}: AddToCartButtonProps) {
    const { addToCart, setCartOpen } = useCart();

    const handleAddToCart = () => {
        // Add main product
        addToCart({
            productId,
            name,
            price,
            quantity,
            image,
            variants,
        });
        
        // Add each add-on product
        addOns.forEach(addon => {
            addToCart({
                productId: addon.productId,
                name: addon.name,
                price: addon.price,
                quantity: 1, // Add-ons default to quantity 1
                image: addon.image,
            });
        });
        
        setCartOpen(true);
    }

    return (
        <Button
            onClick={handleAddToCart}
            disabled={disabled || text !== "加入購物車"}
            size="lg"
            className="w-full h-13 text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 shadow-none rounded-none disabled:opacity-50"
        >
            {text}
        </Button>
    )
}