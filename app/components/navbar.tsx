"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, User, ShoppingCart, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import CartDrawer from "./cartDrawer"
import { useCart } from "@/app/cartProvider"
import { MENU } from "@/app/jsonFiles/menuItems"

// Desktop menu data with right-side promos like the screenshot


export default function Navbar({ navFix }:{ navFix: boolean}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const {cartOpen, setCartOpen} = useCart();
  const closeTimer = useRef<number | null>(null)

  // Solid, light header. `navFix` keeps it pinned on scroll; otherwise it scrolls with the page.
  const navPos = navFix ? "sticky top-0" : "relative"

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
        className={`${navPos} left-0 right-0 z-50 bg-background border-b border-border text-foreground`}
        aria-label="Primary"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Left: search (desktop) / menu (mobile) */}
            <div className="flex items-center w-1/3">
              <div className="lg:hidden">
                <MobileMenu />
              </div>
              <button
                aria-label="開啟搜尋"
                className="hidden lg:inline-flex items-center justify-center p-2 text-foreground hover:opacity-60 transition-opacity"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            {/* Brand wordmark */}
            <Link href="/" className="text-2xl font-light text-white self-center">
              <Image width={150} height={150} src="/logo.svg" alt="Glaze Logo"/>
            </Link>

            {/* Right actions */}
            <div className="flex justify-end items-center gap-4 w-1/3">
              <span className="hidden md:inline-flex text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                HKD / 繁
              </span>

              <button
                aria-label="開啟搜尋"
                className="lg:hidden inline-flex items-center justify-center p-2 text-foreground hover:opacity-60 transition-opacity"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" strokeWidth={1.25} />
              </button>

              {/* Account placeholder */}
              <button
                aria-label="帳戶"
                className="hidden sm:inline-flex items-center justify-center p-2 text-foreground hover:opacity-60 transition-opacity"
              >
                <User className="h-5 w-5" strokeWidth={1.25} />
              </button>

              <button
                aria-label="開啟購物車"
                className="inline-flex items-center justify-center p-2 text-foreground hover:opacity-60 transition-opacity"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>
          </div>

          {/* Desktop nav + Mega menus (full width) */}
          <div className="hidden lg:block pb-2">
            <ul className="flex items-center justify-center gap-8">
              {MENU.map((item, idx) =>
                "dropdown" in item ? (
                  <li key={idx} className="relative" onMouseEnter={() => openIdx(idx)} onMouseLeave={scheduleClose}>
                    <button
                      className={`font-sans text-sm tracking-[0.15em] uppercase pb-1 border-b transition-colors ${
                        activeIdx === idx ? "border-foreground text-foreground" : "border-transparent text-foreground hover:opacity-60"
                      }`}
                    >
                      {item.label.replace(" ▼", "")}
                    </button>

                    {/* Full-width mega panel */}
                    <div
                      onMouseEnter={() => openIdx(idx)}
                      onMouseLeave={scheduleClose}
                      className={`fixed left-0 right-0 top-28 transition-all duration-200 ease-out ${
                        activeIdx === idx ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
                      }`}
                    >
                      <div className="max-w-full">
                        <div className="bg-background text-foreground border-y border-border overflow-hidden">
                          <div className="grid grid-cols-12 gap-8 p-10 max-w-7xl mx-auto">
                            {/* Text columns */}
                            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                              {item.dropdown?.map((section, sIdx) => (
                                <div key={sIdx} className="min-w-48">
                                  {section.title && (
                                    <div className="font-serif italic text-lg text-foreground mb-4">
                                      {section.title}
                                    </div>
                                  )}
                                  <ul className="space-y-2.5">
                                    {section.links.map((l, lIdx) => (
                                      <li key={lIdx}>
                                        <Link
                                          href={l.href}
                                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                                  className="group relative block overflow-hidden"
                                >
                                  <div className="aspect-[3/4] relative bg-muted">
                                    <Image
                                      src={promo.image || "/placeholder.svg"}
                                      alt={promo.alt}
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                  {promo.caption && (
                                    <div className="pt-2 font-serif text-sm text-foreground">{promo.caption}</div>
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
                    <Link
                      href={item.href}
                      className="font-sans text-sm tracking-[0.15em] uppercase text-foreground hover:opacity-60 transition-opacity"
                    >
                      {item.label.replace(" ▼", "")}
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
          aria-label="開啟選單"
          className="inline-flex items-center justify-center p-2 text-foreground hover:opacity-60 transition-opacity"
        >
          <Menu className="h-5 w-5" strokeWidth={1.25} />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[85vw] sm:w-[360px] p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="font-sans text-base tracking-[0.2em] uppercase font-light">Glaze</SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto h-full">
          <ul className="px-2 py-3">
            <Accordion type="single" collapsible className="w-full">
              {MENU.map((item, idx) =>
                "dropdown" in item ? (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border">
                    <AccordionTrigger className="px-2 py-3 font-serif text-lg">{item.label.replace(" ▼", "")}</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 pb-3">
                        {item.dropdown?.map((section, sIdx) => (
                          <div key={sIdx} className="mb-4">
                            {section.title && (
                              <div className="px-2 font-serif italic text-base text-foreground mb-2">
                                {section.title}
                              </div>
                            )}
                            <ul>
                              {section.links.map((l, lIdx) => (
                                <li key={lIdx}>
                                  <SheetClose asChild>
                                    <Link
                                      href={l.href}
                                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                  <li key={idx} className="border-b border-border">
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="block px-4 py-3 font-serif text-lg text-foreground hover:bg-muted"
                      >
                        {item.label.replace(" ▼", "")}
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
        <div className="bg-background border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜尋商品、系列或文章..."
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
            />
            <button onClick={onClose} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
              關閉
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
