import Image from "next/image"
import AddToCartButton from "./clientComponents/addToCartHome"
import Link from "next/link"
import { ProductWithParsedFields } from "@/types/product"

interface ProductShowcaseProps {
  products: ProductWithParsedFields[];
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <button type="button" className="text-gray-600 hover:text-amber-600 transition-colors text-sm">全部</button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {products?.map((product) => (
            <Link
              key={product.id}
              className="group relative bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
              href={`/products/${product.handle}`}
            >
              {/* Product Image Container */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* Main Image */}
                {product.images && product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-0 opacity-100"
                    />
                    
                    <Image
                      src={product.images[1] || product.images[0]}
                      alt={`${product.name} alternate view`}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-100 opacity-0"
                    />
                  </>
                ) : (
                  <Image 
                    src="/placeholder.svg" 
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}

                {/* Add to Cart Button Overlay */}
                <div
                  className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <AddToCartButton 
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images?.[0] || "/placeholder.svg"}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 text-center">
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 font-medium">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
