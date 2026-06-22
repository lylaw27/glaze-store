import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageTextProps {
  alignment: string;
  image: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function ImageTextSection({ props }: { props: ImageTextProps }) {
  const isImageLeft = props.alignment === "left"

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
            isImageLeft ? "" : "lg:grid-flow-col-dense"
          }`}
        >
          {/* Image */}
          <div className={`relative ${isImageLeft ? "" : "lg:col-start-2"}`}>
            <div className="aspect-square lg:aspect-4/5 relative overflow-hidden">
              <Image
                src={props.image || "/placeholder.svg"}
                alt={props.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className={`space-y-6 ${isImageLeft ? "" : "lg:col-start-1"}`}>
            {props.subtitle && <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase">{props.subtitle}</p>}

            <h2 className="font-serif text-4xl lg:text-5xl font-normal text-foreground leading-tight">{props.title}</h2>

            <pre className="font-sans whitespace-pre-wrap text-base text-muted-foreground leading-relaxed">{props.description}</pre>

            {props.buttonText && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="px-8 py-5 text-xs tracking-[0.2em] uppercase border-border hover:bg-muted transition-colors bg-transparent shadow-none"
                >
                  {props.buttonText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
