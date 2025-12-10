"use client"

import { Search, User, ShoppingCart, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createCart, getRegionId } from "../fetch"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    const cartId = localStorage.getItem("cart_id")
    const regionId = localStorage.getItem("region_id")
    if (!regionId || !cartId) {
      getRegionId(0)
      .then((id)=>{
        localStorage.setItem("region_id",id)
        return createCart(id)
      })
      .then((cart)=>{
        localStorage.setItem("cart_id",cart.id);
      });
    }
    // create a cart and store it in the localStorage

  }, [])

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(window.scrollY > 200)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navItems = [
    "最新款式",
    "輕珠寶系列 ▼",
    "手鏈 ▼",
    "戒指",
    "項鏈 ▼",
    "耳環",
    "水晶系列 ▼",
    "功效類別",
    "家居水晶 ▼",
    "Blog ▼",
    "探索更多 ▼",
  ]

  const solid = hasScrolled || isMobileMenuOpen
  const bgClass = solid ? "bg-[#3D485E] shadow-sm" : "bg-transparent"
  const textClass = solid ? "text-white" : "text-white"
  const iconClass = solid ? "text-white" : "text-white"
  const navDisplay = solid ? "fixed" : "absolute"

  return (
    <nav
      className={[
        "top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out",
        bgClass,
        navDisplay
      ].join(" ")}
      aria-label="Primary"
    >
      <div className="container mx-auto px-4 py-4">
          {/* Logo */}
        <div className="flex items-center justify-between">
          <Search className={["w-5 h-5 cursor-pointer", iconClass].join(" ")} />
          <div className={["text-2xl font-light", textClass].join(" ")}>White on</div>
          {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <User className={["w-5 h-5 cursor-pointer", iconClass].join(" ")} />
              <ShoppingCart className={["w-5 h-5 cursor-pointer", iconClass].join(" ")} />

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden w-6 h-6 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className={["w-6 h-6", iconClass].join(" ")} />
                ) : (
                  <Menu className={["w-6 h-6", iconClass].join(" ")} />
                )}
              </button>
            </div>
          </div>
        {/* Desktop Navigation Menu */}
        <div className="flex items-center justify-center">
          <div className="hidden lg:flex items-center space-x-8 text-sm py-2">
            {navItems.map((item, idx) => (
              <span key={idx} className={[textClass, "cursor-pointer whitespace-nowrap"].join(" ")}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
        >
          <div className="mt-4 py-4 bg-white/95 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-3 px-4">
              {navItems.map((item, index) => (
                <span
                  key={index}
                  className="text-gray-700 hover:text-emerald-600 cursor-pointer py-2 border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  )
}
