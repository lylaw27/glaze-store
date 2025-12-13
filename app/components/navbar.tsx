"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, User, ShoppingCart, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import CartDrawer from "./cartDrawer"
import { useCart } from "@/app/cartProvider"
import { MenuItem } from "@/types"

// Desktop menu data with right-side promos like the screenshot
const MENU: MenuItem[] = [
  {
    label: "最新款式",
    href: "/new",
  },
  {
    label: "輕珠寶系列 ▼",
    dropdown: [
      {
        title: "精選系列",
        links: [
          { label: "KNIT 系列", href: "/collections/knit" },
          { label: "Wavy Heart", href: "/collections/wavy-heart" },
          { label: "Minimal", href: "/collections/minimal" },
        ],
      },
      {
        title: "材質",
        links: [
          { label: "925 純銀", href: "/materials/925" },
          { label: "14K 包金", href: "/materials/14k" },
          { label: "天然寶石", href: "/materials/gem" },
        ],
      },
      {
        title: "風格",
        links: [
          { label: "鎖骨鏈", href: "/necklaces/collarbone" },
          { label: "雙層項鏈", href: "/necklaces/double" },
          { label: "精緻幼鏈", href: "/necklaces/delicate" },
        ],
      },
    ],
    promos: [
      { image: "/images/product22-1.jpeg", alt: "精選款式", caption: "精選款式", href: "/collections/featured" },
      { image: "/images/product21-1.jpeg", alt: "黑太陽石", caption: "黑太陽石", href: "/crystal/black-sunstone" },
    ],
  },
  {
    label: "手鏈 ▼",
    dropdown: [
      {
        title: "風格",
        links: [
          { label: "雙圈手鏈", href: "/bracelets/double" },
          { label: "混珠手鏈", href: "/bracelets/mixed" },
          { label: "男士手鏈", href: "/bracelets/men" },
        ],
      },
      {
        title: "主題",
        links: [
          { label: "愛情", href: "/theme/love" },
          { label: "財富", href: "/theme/wealth" },
          { label: "全面功效", href: "/theme/all" },
        ],
      },
      {
        title: "材質",
        links: [
          { label: "14K 包金", href: "/materials/14k" },
          { label: "925 純銀", href: "/materials/925" },
        ],
      },
    ],
    promos: [
      { image: "/images/product16-1.jpeg", alt: "熱賣款", caption: "熱賣款", href: "/collections/bestsellers" },
      { image: "/images/product19-1.jpeg", alt: "黑曜石", caption: "黑曜石", href: "/crystal/obsidian" },
    ],
  },
  { label: "戒指", href: "/rings" },
  {
    label: "項鏈 ▼",
    dropdown: [
      {
        links: [
          { label: "月亮石", href: "/necklaces/moonstone" },
          { label: "石榴石", href: "/necklaces/garnet" },
          { label: "托帕石", href: "/necklaces/topaz" },
        ],
      },
      {
        links: [
          { label: "鎖骨鏈", href: "/necklaces/collarbone" },
          { label: "雙層項鏈", href: "/necklaces/double" },
          { label: "精緻幼鏈", href: "/necklaces/delicate" },
        ],
      },
      {
        links: [
          { label: "簡約", href: "/necklaces/minimal" },
          { label: "復古", href: "/necklaces/vintage" },
        ],
      },
    ],
    promos: [
      { image: "/images/product14-1.jpeg", alt: "新品推薦", caption: "新品推薦", href: "/collections/new" },
      { image: "/images/product12-1.jpeg", alt: "暢銷項鏈", caption: "暢銷項鏈", href: "/collections/top-necklaces" },
    ],
  },
  { label: "耳環", href: "/earrings" },
  {
    label: "水晶系列 ▼",
    dropdown: [
      {
        links: [
          { label: "智慧與靈性", href: "/crystal/spiritual" },
          { label: "釋放負能量", href: "/crystal/cleanse" },
          { label: "療癒情緒", href: "/crystal/heal" },
        ],
      },
      {
        links: [
          { label: "人緣", href: "/crystal/social" },
          { label: "健康", href: "/crystal/health" },
          { label: "家居水晶", href: "/crystal/home" },
        ],
      },
      {
        links: [
          { label: "彩寶", href: "/crystal/colored" },
          { label: "透明系", href: "/crystal/clear" },
        ],
      },
    ],
    promos: [
      { image: "/images/product8-1.jpeg", alt: "人氣搭配", caption: "人氣搭配", href: "/collections/popular-set" },
      { image: "/images/product10-1.jpeg", alt: "風格推薦", caption: "風格推薦", href: "/collections/styles" },
    ],
  },
  { label: "功效類別", href: "/effects" },
  {
    label: "家居水晶 ▼",
    dropdown: [
      {
        links: [
          { label: "擺設", href: "/home/decor" },
          { label: "能量石", href: "/home/stone" },
        ],
      },
    ],
    promos: [{ image: "/images/hero4-1.jpeg", alt: "家居專區", caption: "家居專區", href: "/home" }],
  },
  {
    label: "Blog ▼",
    dropdown: [
      {
        links: [
          { label: "最新文章", href: "/blog" },
          { label: "品牌故事", href: "/blog/story" },
        ],
      },
    ],
  },
  {
    label: "探索更多 ▼",
    dropdown: [
      {
        links: [
          { label: "門市資訊", href: "/stores" },
          { label: "會員獎賞", href: "/rewards" },
        ],
      },
    ],
  },
]

export default function Navbar({ navFix }:{ navFix: boolean}) {
  const [scrolled, setScrolled] = useState(navFix)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const {cartOpen, setCartOpen} = useCart();
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    if(!navFix){
      const onScroll = () => setScrolled(window.scrollY > 200)
      onScroll()
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => window.removeEventListener("scroll", onScroll)
    }
  }, [navFix])

  const navBg = scrolled ? "bg-secondary/100 shadow-sm" : "bg-transparent"
  const navPos = navFix ? "sticky" : scrolled ? "fixed" : "absolute"

  // Helpers to keep full-width mega open when moving mouse to panel
  const openIdx = (idx: number) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setActiveIdx(idx)
  }
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setActiveIdx(null), 100)
  }

  return (
    <>
      {/* Top search panel */}
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <nav
        className={`${navPos} top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out ${navBg}`}
        aria-label="Primary"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="h-24 flex items-center justify-between">
              {/* Mobile menu trigger */}
              <div className="lg:hidden w-1/4">
                <MobileMenu />
              </div>

            {/* Left: Search trigger */}
            <div className="w-1/4 hidden lg:inline-flex">
              <button
                aria-label="Open search"
                className="items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setSearchOpen(true)}
                >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Brand */}
            <Link href="/" className="text-2xl font-light text-white self-center">
              <Image width={90} height={90} src="/images/glaze-logo.png" alt="Glaze Logo"/>
            </Link>

            {/* Right actions */}
            <div className="flex justify-end items-center gap-3 w-1/4">
              <button
                aria-label="Open search"
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-6 w-6" />
              </button>

              <button
                aria-label="Open cart"
                className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6" />
              </button>

              {/* User placeholder */}
              <button
                aria-label="Account"
                className="hidden sm:inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop nav + Mega menus (full width) */}
          <div className="hidden lg:block h-12">
            <ul className="flex items-center justify-center gap-7">
              {MENU.map((item, idx) =>
                "dropdown" in item ? (
                  <li key={idx} className="relative" onMouseEnter={() => openIdx(idx)} onMouseLeave={scheduleClose}>
                    <button className="text-sm tracking-wide text-white">{item.label}</button>

                    {/* Full-width mega panel */}
                    <div
                      onMouseEnter={() => openIdx(idx)}
                      onMouseLeave={scheduleClose}
                      className={`fixed left-0 right-0 top-35 transition-all duration-200 ease-out ${
                        activeIdx === idx ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
                      }`}
                    >
                      <div className="max-w-full">
                        <div className="bg-white text-gray-900 shadow-lg ring-1 ring-black/5 overflow-hidden">
                          <div className="grid grid-cols-12 gap-8 p-8">
                            {/* Text columns */}
                            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                              {item.dropdown?.map((section, sIdx) => (
                                <div key={sIdx} className="min-w-48">
                                  {section.title && (
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                      {section.title}
                                    </div>
                                  )}
                                  <ul className="space-y-2">
                                    {section.links.map((l, lIdx) => (
                                      <li key={lIdx}>
                                        <Link
                                          href={l.href}
                                          className="block text-sm text-gray-700 hover:text-gray-900 hover:underline underline-offset-4"
                                        >
                                          {l.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {/* Promo images */}
                            <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-6">
                              {(item.promos ?? []).slice(0, 2).map((promo, pIdx) => (
                                <Link
                                  key={pIdx}
                                  href={promo.href || "#"}
                                  className="group relative block rounded-md overflow-hidden ring-1 ring-black/5"
                                >
                                  <div className="aspect-4/3 relative">
                                    <Image
                                      src={promo.image || "/placeholder.svg"}
                                      alt={promo.alt}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  </div>
                                  {promo.caption && (
                                    <div className="px-3 py-2 text-sm font-medium text-gray-800">{promo.caption}</div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={idx}>
                    <Link href={item.href} className="text-sm tracking-wide text-white">
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

/* Mobile menu: sliding drawer with accordion dropdowns */
function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[85vw] sm:w-[360px] p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-lg">選單</SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto h-full">
          <ul className="px-2 py-3">
            <Accordion type="single" collapsible className="w-full">
              {MENU.map((item, idx) =>
                "dropdown" in item ? (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-b">
                    <AccordionTrigger className="px-2 py-3 text-base">{item.label.replace(" ▼", "")}</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 pb-3">
                        {item.dropdown?.map((section, sIdx) => (
                          <div key={sIdx} className="mb-4">
                            {section.title && (
                              <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {section.title}
                              </div>
                            )}
                            <ul>
                              {section.links.map((l, lIdx) => (
                                <li key={lIdx}>
                                  <SheetClose asChild>
                                    <Link
                                      href={l.href}
                                      className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      {l.label}
                                    </Link>
                                  </SheetClose>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <li key={idx} className="border-b">
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="block px-4 py-3 text-base text-gray-800 hover:bg-gray-100 rounded-none"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                ),
              )}
            </Accordion>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

/* Search overlay sliding from top */
function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-60 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`fixed left-0 right-0 z-60 transform transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ top: 0 }}
      >
        <div className="bg-white shadow-md ring-1 ring-black/10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜尋商品、系列或文章..."
              className="flex-1 bg-transparent outline-none text-base placeholder:text-gray-400"
            />
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">
              關閉
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
