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
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <SheetTitle className="font-serif text-2xl font-normal">您的購物車</SheetTitle>
                <SheetClose asChild>
                <button aria-label="關閉購物車" className="p-2 hover:bg-muted transition-colors">
                    <X className="h-5 w-5" strokeWidth={1.25} />
                </button>
                </SheetClose>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {!cart.items || cart.items.length === 0 ? (
                <div className="text-center text-muted-foreground">你的購物車是空的</div>
                ) : (
                cart.items.map((item) => (
                    <div key={item.id} className="border-b border-border pb-8">
                    {/* Item top row */}
                    <div className="grid grid-cols-[96px_1fr_auto] gap-4 items-start">
                        <div className="relative h-24 w-24 overflow-hidden border border-border bg-muted">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="font-serif text-base text-foreground">{item.name}</div>
                            {item.variants && Object.keys(item.variants).length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    {Object.entries(item.variants).map(([key, value]) => (
                                        <span key={key} className="mr-2">
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            )}

                        {/* Quantity stepper */}
                        <div>
                            <div className="inline-flex items-center border border-border">
                                <button
                                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                    className="px-3 py-2 hover:bg-muted disabled:opacity-50"
                                    aria-label="減少數量"
                                    disabled={item.quantity <= 1}
                                >
                                <Minus className="h-4 w-4" strokeWidth={1.25} />
                                </button>
                                <div className="px-4 py-2 text-sm tabular-nums">{item.quantity}</div>
                                <button
                                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                    className="px-3 py-2 hover:bg-muted"
                                    aria-label="增加數量"
                                >
                                <Plus className="h-4 w-4" strokeWidth={1.25} />
                                </button>

                            </div>
                            {/* Price + remove */}
                            <div className="text-right">
                            <div className="font-serif text-base text-foreground">{fmt(item.price * item.quantity)}</div>
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
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
                    <p className="text-muted-foreground text-sm leading-6 mb-2">{info}</p>
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
            <div className="px-6 py-5 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                <span className="text-base tracking-wide">小計</span>
                <span className="font-serif text-lg">{fmt(subtotal)}</span>
                </div>
                <p className="text-sm text-muted-foreground">結賬時計算運費、稅金和折扣代碼。</p>
                    <Button
                        asChild
                        className="w-full rounded-none bg-primary text-primary-foreground py-6 text-xs tracking-[0.2em] uppercase hover:bg-primary/90 shadow-none"
                        onClick={() => onOpenChange(false)}>
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