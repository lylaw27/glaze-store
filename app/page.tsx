import HeroSection from "./components/hero-carousel-section";
import HeroImageSection from "./components/hero-image-section";
import Navbar from "./components/navbar";
import ProductShowcase from "./components/product-showcase";
import ProductGrid from "./components/product-grid";
import { hero1, hero2, hero3, hero4 } from "./jsonFiles/heroContent";
import { categories } from "./jsonFiles/categories";
import { imageText1, imageText2 } from "./jsonFiles/imagetext";
import ImageTextSection from "./components/image-text-section";
import Footer from "./components/footer";
import { getProducts } from "./fetch";

export default async function Home () {
  const products = await getProducts();

  return (
    <div>
      <Navbar navFix={false}/>
      <HeroSection slides={hero1}/>
      <ProductShowcase products={products.slice(0,4)}/>
      <HeroSection slides={hero2}/>
      <ProductShowcase products={products.slice(4,8)}/>
      <HeroImageSection slide={hero3} />
      <ProductShowcase products={products.slice(8,12)}/>
      <ProductGrid categories={categories}/>
      <ProductShowcase products={products.slice(12,16)}/>
      <HeroImageSection slide={hero4} />
      <ProductShowcase products={products.slice(16,20)}/>
      <ImageTextSection props={imageText1}/>
      <ImageTextSection props={imageText2}/>
      <Footer/>
    </div>
  );
}
