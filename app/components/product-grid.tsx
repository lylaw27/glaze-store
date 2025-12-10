import Image from "next/image"
import { Category } from "../interface/static"


export default function ProductGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">功效類別</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`relative group cursor-pointer overflow-hidden rounded-lg ${
              category.span === "double" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="aspect-[4/3] relative">
              <Image 
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-white font-medium text-lg leading-tight">{category.title}</h3>
                {category.description && <p className="text-white/90 text-sm mt-2">{category.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}