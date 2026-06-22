"use client"

import Image from "next/image"
import AddToCartButton from "./clientComponents/addToCartHome"
import Link from "next/link"
import { ProductWithParsedFields } from "@/types/product"
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductShowcaseProps {
  products: ProductWithParsedFields[];
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const currency = (n: number) =>
    new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <Link href="/products" className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">全部</Link>
        </div>

        {/* Products Carousel */}
        <div className="relative group">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border border-border p-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.25} />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border border-border p-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-foreground" strokeWidth={1.25} />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products?.map((product) => (
              <Link
                key={product.id}
                className="group/item relative overflow-hidden flex-shrink-0 w-[280px]"
                href={`/products/${product.handle}`}
              >
                {/* Product Image Container */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  {/* Main Image */}
                  {product.images && product.images.length > 0 ? (
                    <>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-opacity duration-300 group-hover/item:opacity-0 opacity-100"
                      />
                      
                      <Image
                        src={product.images[1] || product.images[0]}
                        alt={`${product.name} alternate view`}
                        fill
                        className="object-cover transition-opacity duration-300 group-hover/item:opacity-100 opacity-0"
                      />
                    </>
                  ) : (
                    <Image 
                      src="/placeholder.svg" 
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* Add to Cart Button Overlay */}
                  <div
                    className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/item:opacity-100"
                  >
                    <AddToCartButton 
                      productId={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.images?.[0] || "/placeholder.svg"}
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="pt-3 text-left">
                  <h3 className="font-serif text-base text-foreground mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currency(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
