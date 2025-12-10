"use client"

import { useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { Sheet, SheetContent, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { X, Minus, Plus } from "lucide-react"
import { useCart } from "@/app/cartProvider";
import { Button } from "@/components/ui/button";

/* Cart drawer sliding from the right */

export default function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const info = "備註：如需禮盒包裝請在此處說明。";
    const [note, setNote] = useState<string>("");
    const { cart, updateQuantity, removeItem, getCartTotal } = useCart();

    const fmt = (n: number) =>
        new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

    const handleUpdateQty = (itemId: string, quantity: number) => {
        updateQuantity(itemId, quantity);
    }

    const updateNote = (note: string) => {
        setNote(note);
    }

    const handleRemoveItem = (itemId: string) => {
        removeItem(itemId);
    }

    const subtotal = getCartTotal();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[92vw] sm:max-w-[520px] p-0">
            <div className="flex h-full flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between">
                <SheetTitle className="text-2xl font-semibold">您的購物車</SheetTitle>
                <SheetClose asChild>
                <button aria-label="Close cart" className="p-2 rounded-md hover:bg-gray-100">
                    <X className="h-5 w-5" />
                </button>
                </SheetClose>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {!cart.items || cart.items.length === 0 ? (
                <div className="text-center text-gray-600">你的購物車是空的</div>
                ) : (
                cart.items.map((item) => (
                    <div key={item.id} className="border-b pb-8">
                    {/* Item top row */}
                    <div className="grid grid-cols-[96px_1fr_auto] gap-4 items-start">
                        <div className="relative h-24 w-24 overflow-hidden rounded-md ring-1 ring-black/10">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>

                        {/* Quantity stepper */}
                        <div>
                            <div className="inline-flex items-center rounded-md border border-gray-300">
                                <button
                                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                    className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                                    aria-label="減少數量"
                                    disabled={item.quantity <= 1}
                                >
                                <Minus className="h-4 w-4" />
                                </button>
                                <div className="px-4 py-2 text-sm tabular-nums">{item.quantity}</div>
                                <button
                                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                    className="px-3 py-2 hover:bg-gray-50"
                                    aria-label="增加數量"
                                >
                                <Plus className="h-4 w-4" />
                                </button>
                                
                            </div>
                            {/* Price + remove */}
                            <div className="text-right">
                            <div className="text-base font-medium">{fmt(item.price * item.quantity)}</div>
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="mt-2 text-xs text-gray-500 hover:text-gray-800 underline underline-offset-4"
                            >
                                移除
                            </button>
                            </div>
                            </div>
                        </div>
                    </div>
                    </div>
                ))
                )}
                {/* Info line */}
                {/* Notes textarea */}
                {info && cart.items.length > 0 && 
                
                <div>
                    <p className="text-gray-700 text-sm leading-6 mb-2">{info}</p>
                    <Textarea
                        value={note}
                        onChange={(e) => updateNote(e.target.value)}
                        placeholder="可在此處填寫尺寸、備註或其它要求..."
                        className="min-h-[120px] resize-vertical"
                    />
                    </div>
                    }
            </div>

            {/* Summary */}
            <div className="px-6 py-5 border-t space-y-4">
                <div className="flex items-center justify-between">
                <span className="text-lg">小計</span>
                <span className="text-lg font-medium">{fmt(subtotal)}</span>
                </div>
                <p className="text-sm text-gray-500">結賬時計算運費、稅金和折扣代碼。</p>
                    <Button
                        asChild
                        className="w-full rounded-md bg-black text-white py-3 text-sm font-medium hover:bg-black/90">
                        <Link href="/checkout">
                            前往結帳
                        </Link>
                    </Button>
            </div>
            </div>
        </SheetContent>
        </Sheet>
    )
}