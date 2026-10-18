import HeroImageSection from "./components/hero-image-section";
import Navbar from "./components/navbar";
import ProductShowcase from "./components/product-showcase";
import { hero1m } from "./jsonFiles/heroContent";
import Footer from "./components/footer";
import { getProducts, getCategories } from "./fetch";
import type { ProductWithParsedFields } from "@/types/product";

export default async function Home() {
  const [products, categoriesList]: [
    ProductWithParsedFields[],
    Awaited<ReturnType<typeof getCategories>>,
  ] = await Promise.all([getProducts(), getCategories()]);
  const categories = Object.values(categoriesList).flat();
  const categoryHandles = new Set(categories.map((category) => category.handle));
  const uncategorizedProducts = products.filter(
    (product) => !product.categories.some((handle) => categoryHandles.has(handle)),
  );

  return (
    <div>
      <Navbar navFix={false} />
      <main>
        <HeroImageSection slide={hero1m} />
        <div className="py-4 sm:py-8">
          {categories.map((category) => {
            const categoryProducts = products.filter((product) =>
              product.categories.includes(category.handle),
            );

            if (categoryProducts.length === 0) return null;

            return (
              <ProductShowcase
                key={category.handle}
                title={category.name}
                href={`/products?${new URLSearchParams({ category: category.handle })}`}
                products={categoryProducts.slice(0, 4)}
              />
            );
          })}
          {uncategorizedProducts.length > 0 && (
            <ProductShowcase
              title="最新款式"
              href="/products"
              products={uncategorizedProducts.slice(0, 4)}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
