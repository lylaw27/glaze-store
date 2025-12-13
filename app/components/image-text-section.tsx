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
            <div className="aspect-square lg:aspect-4/5 relative overflow-hidden rounded-lg">
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
            {props.subtitle && <p className="text-sm text-gray-600 tracking-wide uppercase">{props.subtitle}</p>}

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{props.title}</h2>

            <pre className="whitespace-pre-wrap text-lg text-gray-600 leading-relaxed">{props.description}</pre>

            {props.buttonText && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="px-8 py-3 text-base border-gray-300 hover:bg-gray-50 transition-colors bg-transparent"
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
