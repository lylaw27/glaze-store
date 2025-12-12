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
            variant="outline"
            disabled={disabled || text !== "加入購物車"}
            size="lg"
            className="w-full text-white h-12 font-medium bg-[#5A31F4] hover:bg-[#4C28D4] hover:text-white"
        >
            {text}
        </Button>
    )
}