import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { HeroSlide } from "@/types"

export default function HeroImageSection({slide}: { slide: HeroSlide }) {

  return (
    <div className="relative min-h-[80vh] bg-linear-to-br from-stone-100 to-stone-200 overflow-hidden touch-pan-y">
      {/* Carousel Container */}
      <div className="relative h-[80vh]">
        {/* Slides */}
            <div key={slide.id} className="min-w-full h-[80vh] relative flex items-center">
              {/* Background Image */}
              <div className="absolute inset-0"> 
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={`Slide ${slide.id}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gray-900/40"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 container mx-auto px-4">
                <div className="max-w-2xl">
                  {/* Main Heading */}
                  <h1 className="md:text-6xl text-5xl font-light text-white mb-6 leading-tight animate-fade-in">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="md:text-lg text-md text-white/90 mb-8 leading-relaxed animate-fade-in-delay">
                    {slide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-light animate-fade-in-delay-2"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
        </div>
      </div>
    </div>
  )
}
