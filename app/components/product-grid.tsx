import Image from "next/image"
import { Category } from "../jsonFiles/categories"

export default function ProductGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="font-serif text-3xl lg:text-4xl font-normal mb-10 text-foreground">功效類別</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`relative group cursor-pointer overflow-hidden ${
              category.span === "double" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="aspect-4/3 relative">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="font-serif text-white text-2xl lg:text-3xl font-normal leading-tight">{category.title}</h3>
                {category.description && <p className="text-white/90 text-sm mt-2">{category.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}