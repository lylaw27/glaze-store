"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Plus, Minus, Search, Globe, X, Star } from "lucide-react"
import { StoreProduct } from "@medusajs/types"
import AddToCartButton from "./clientComponents/addToCartProduct"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@lib/components/ui/accordion"
import { Checkbox } from "@lib/components/ui/checkbox"
import { StoreProductAddon } from "../products/[handle]/page"

const FAQ_DATA = [
  {
    question: "保養方式",
    answer:
      "建議定期使用軟布擦拭，避免接觸化學物質。可使用白水晶碎石淨化，或在月圓之夜放置於月光下淨化。避免碰撞和刮擦，不佩戴時請妥善收納。",
  },
  {
    question: "材質說明",
    answer:
      "採用天然水晶和寶石，每顆石頭的紋理和色澤都是獨一無二的。金屬部分使用14K包金或925純銀，經過嚴格品質檢測，確保材質安全無害。",
  },
  {
    question: "尺寸指南",
    answer:
      "手鏈標準尺寸為16-17cm，可根據個人喜好調整鬆緊度。戒指提供多種尺寸選擇，建議到門市試戴或使用我們的尺寸測量指南。如需特殊尺寸，請聯繫客服。",
  },
  {
    question: "寄出時間",
    answer:
      "現貨商品於付款確認後1-2個工作天內寄出。客製化商品需要5-7個工作天製作時間。香港地區一般1-2天到達，海外地區需要3-7個工作天。",
  },
  {
    question: "包裝及贈品",
    answer:
      "所有商品均附贈精美包裝盒和保養說明卡。滿指定金額可獲得限量贈品，詳情請查看當期優惠活動。如需禮品包裝服務，請在訂單備註中說明。",
  },
]

export default function product({ product }: { product: StoreProductAddon }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    product.variants && product.options && product.options[0].title === "Default option" ? 
    {[product.options[0].id!]: product.options[0].values[0].id!} : 
    {}
  )
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">產品未找到</h1>
        <Link href="/collections" className="text-blue-600 hover:underline">
          返回商品列表
        </Link>
      </div>
    )
  }

  const currency = (n: number) =>
    new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

  const handleBuyNow = () => {
    // if (!selectedSize) {
    //   alert("請選擇尺寸")
    //   return
    // }
    // Buy now logic here
    // console.log("Buy now:", { product: product.title, size: selectedSize, quantity })
  }

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  const selectedVariant = useMemo(() => {
    if (
      !product?.variants ||
      !product.options || 
      Object.keys(selectedOptions).length !== product.options?.length
    ) {
      return
    }

    const variant = product.variants.find((variant) => variant.options?.every(
      (optionValue) => optionValue.id === selectedOptions[optionValue.option_id!]
    ))

    console.log(selectedOptions)

    return variant
    }, [selectedOptions, product])



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">主頁</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/collections/${product.collection.handle}`}>{product.collection.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage].url || "/placeholder.svg?height=600&width=600&query=product%20image"}
              alt={product.title}
              fill
              className="object-cover cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
              priority
            />
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors"
              aria-label="放大圖片"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square bg-gray-50 rounded-md overflow-hidden ring-2 transition-colors ${
                  selectedImage === idx ? "ring-gray-900" : "ring-transparent hover:ring-gray-300"
                }`}
              >
                <Image
                  src={img.url || "/placeholder.svg?height=150&width=150&query=product%20thumbnail"}
                  alt={`${product.title} 圖片 ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 150px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="text-2xl font-semibold text-gray-900 mb-2">{currency(product.variants[0].calculated_price?.calculated_amount)}</div>
            <p className="text-sm text-gray-600">結賬時計算運費。</p>
          </div>

          {/* Shipping Info */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Globe className="h-4 w-4" />
            <span>全球運送</span>
          </div>

          {/* Size Selector */}
          {product.options[0].title != "Default option" && product.options?.map(option=>
          <div key={option.id}>
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-900">{option.title}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {option.values?.map((optionValue) => (
                <button
                    key={optionValue.id}
                    onClick={() => setSelectedOptions((prev) => {
                        return {
                        ...prev,
                        [option.id!]: optionValue.id!,
                    }})}
                    // disabled={variant.manage_inventory && variant.inventory_quantity <= 0}
                    className={`relative h-12 border rounded-md text-sm font-medium transition-colors ${
                    // variant.manage_inventory && variant.inventory_quantity <= 0
                    //   ? "border-gray-200 text-gray-400 cursor-not-allowed" :
                    selectedOptions[option.id] === optionValue.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-900 hover:border-gray-400"
                  }`}
                >
                  {optionValue.value}
                  {/* {variant.inventory_quantity <= 0 && ( */}
                    {/* <div className="absolute inset-0 flex items-center justify-center">
                      <X className="h-6 w-6 text-gray-400" />
                    </div> */}
                  {/* )} */}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Quantity */}
          <div>
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-900">數量</span>
            </div>
            <div className="inline-flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50 disabled:opacity-50"
                disabled={quantity <= 1}
                aria-label="減少數量"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="px-4 py-3 text-base font-medium tabular-nums min-w-[3rem] text-center">{quantity}</div>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50" aria-label="增加數量">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        
          {/* Add to Cart Buttons */}
          <div className="space-y-3">
            <AddToCartButton 
                productIds={[selectedVariant?.id, ...selectedAddons]}
                text={
                    Object.keys(selectedOptions).length != product.options?.length ? 
                    "請選擇款色" :
                    selectedVariant && (!selectedVariant?.manage_inventory || selectedVariant?.inventory_quantity > 0) ? 
                    "加入購物車" : "已售罄"
                }
                quantity={quantity}
            />
            {/* <Button
              onClick={handleBuyNow}
              size="lg"
              className="w-full h-12 text-base font-medium bg-[#5A31F4] hover:bg-[#4C28D4] text-white"
            >
              立即購買
            </Button> */}
            {/* <button className="w-full text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4">
              更多付款選項
            </button> */}
          </div>

          {/* Product Add-ons */}
      {product.addon && product.addon.length > 0 && (
        <div className="mt-16 space-y-4">
          {product.addon.map((addon) => (
            <div key={addon.id} className={`bg-gray-50 rounded-lg p-4 border-1 ${selectedAddons.includes(addon.id) ? "border-gray-500" : "border-gray-300"}`}>
              <div className="flex gap-4 items-center">
                <Checkbox
                  id={addon.id}
                  checked={selectedAddons.includes(addon.variants[0].id)}
                  onCheckedChange={() => toggleAddon(addon.variants[0].id)}
                  className="mt-1"
                />
                <div className="flex-shrink-0">
                  <Image
                    src={addon.images[0].url || "/placeholder.svg?height=80&width=80&query=addon%20image"}
                    alt={addon.title}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label htmlFor={addon.id} className="text-base font-medium text-gray-900 cursor-pointer">
                          {addon.title}
                        </label>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">{currency(addon.variants[0].calculated_price?.calculated_amount)}</div>
                      <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

          {/* Product Description */}
          {product.description && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">產品描述</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      

      {/* Detailed Product Description */}
      {/* <div className="mt-16 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">商品描述</h2> */}

          {/* Specifications */}
          {/* {product.specifications && (
            <div className="mb-8">
              <ul className="space-y-2">
                {product.specifications.map((spec, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* Detailed descriptions */}
          {/* {product.description && (
            <div className="space-y-6">
                <div className="text-sm text-gray-700 leading-relaxed">
                    <p>{product.description}</p>
                </div>
            </div>
          )}
        </div>
      </div> */}

      {/* FAQ Section */}
      <div className="mt-16">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_DATA.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger className="text-left text-base font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              aria-label="關閉放大圖片"
            >
              <X className="h-8 w-8" />
            </button>
            <div
              className="relative w-full h-[80vh] bg-transparent rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={product.images[selectedImage].url || "/placeholder.svg?height=800&width=800&query=product%20image"}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="90vw"
                priority
              />
            </div>

            {/* Navigation arrows for zoom modal */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="上一張圖片"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => (prev + 1) % product.images.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="下一張圖片"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
              {selectedImage + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
