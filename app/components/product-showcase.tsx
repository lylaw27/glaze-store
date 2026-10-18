import Image from "next/image"
import AddToCartButton from "./clientComponents/addToCartHome"
import Link from "next/link"
import type { ProductWithParsedFields } from "@/types/product"

interface ProductShowcaseProps {
  products: ProductWithParsedFields[];
  title: string;
  href: string;
}

export default function ProductShowcase({ products, title, href }: ProductShowcaseProps) {
  const currency = (n: number) =>
    new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

  return (
    <section aria-label={title} className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-5 font-serif text-lg font-normal text-foreground sm:mb-6 sm:text-xl">{title}</h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <article key={product.id} className="group/item min-w-0">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Link href={`/products/${product.handle}`} className="absolute inset-0">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1023px) 50vw, (max-width: 1280px) 25vw, 280px"
                    className={`object-cover transition-opacity duration-300 ${product.images[1] ? "group-hover/item:opacity-0" : ""}`}
                  />
                  {product.images[1] && (
                    <Image
                      src={product.images[1]}
                      alt={`${product.name} alternate view`}
                      fill
                      sizes="(max-width: 1023px) 50vw, (max-width: 1280px) 25vw, 280px"
                      className="object-cover opacity-0 transition-opacity duration-300 group-hover/item:opacity-100"
                    />
                  )}
                </Link>

                <div className="absolute inset-x-2 bottom-2 flex justify-center transition-opacity duration-300 sm:inset-x-4 sm:bottom-4 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100">
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0] || "/placeholder.svg"}
                  />
                </div>
              </div>

              <div className="pt-4 text-left">
                <h3 className="mb-1 font-serif text-sm leading-relaxed text-foreground sm:text-base">
                  <Link href={`/products/${product.handle}`} className="line-clamp-2 transition-opacity hover:opacity-60">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">{currency(product.price)}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:mt-16 lg:mt-20">
          <Link
            href={href}
            aria-label={`查看全部${title}`}
            className="inline-flex min-h-12 items-center justify-center bg-[#f1f2f2] px-8 py-4 text-sm text-foreground transition-colors hover:bg-[#e5e7e7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:text-base"
          >
            查看全部
          </Link>
        </div>
      </div>
    </section>
  )
}
