import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { HeroSlide } from "@/types"

export default function HeroImageSection({
  slide,
  className = "h-[100vh]",
  compact = false,
}: {
  slide: HeroSlide
  className?: string
  compact?: boolean
}) {
  // With a link, the whole section is clickable: zoom on hover.
  const linked = Boolean(slide.buttonLink)

  const content = (
    <div key={slide.id} className="h-full relative flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image || "/placeholder.svg"}
          alt={`Slide ${slide.id}`}
          fill
          className={`object-cover ${linked ? "transition-transform duration-700 ease-out group-hover:scale-105" : ""}`}
        />
        <div className={`absolute inset-0 bg-gray-900/40 ${linked ? "transition-colors duration-700 group-hover:bg-gray-900/30" : ""}`}></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl">
          {/* Main Heading */}
          <h1 className={`font-serif font-light text-white ${compact ? "md:text-5xl text-3xl mb-3" : "md:text-7xl text-5xl mb-6"} leading-[1.05] whitespace-pre-line animate-fade-in`}>
            {slide.title}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <p className={`text-white/90 leading-relaxed animate-fade-in-delay ${compact ? "md:text-base text-sm" : "md:text-lg text-md"} ${compact ? "mb-5" : "mb-8"}`}>
              {slide.subtitle}
            </p>
          )}

          {/* CTA Button: a span when linked, since the whole section is already the link */}
          <Button
            asChild={linked}
            variant="outline"
            size="lg"
            className={`bg-transparent border border-white text-white hover:bg-white hover:text-foreground ${linked ? "group-hover:bg-white group-hover:text-foreground" : ""} px-8 ${compact ? "py-4" : "py-5"} text-xs tracking-[0.2em] uppercase font-normal shadow-none animate-fade-in-delay-2`}
          >
            {linked ? <span>{slide.buttonText}</span> : slide.buttonText}
          </Button>
        </div>
      </div>
    </div>
  )

  const wrapperClass = `relative bg-linear-to-br from-stone-100 to-stone-200 overflow-hidden touch-pan-y ${className}`

  return linked ? (
    <Link href={slide.buttonLink!} aria-label={slide.buttonText} className={`group block ${wrapperClass}`}>
      {content}
    </Link>
  ) : (
    <div className={wrapperClass}>{content}</div>
  )
}
