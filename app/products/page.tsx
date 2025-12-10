import Navbar from "../components/navbar"; 
import Footer from "../components/footer";
import CollectionGrid from "../components/collection-grid";
import HeroImageSection from "../components/hero-image-section";
import { hero4 } from "../jsonFiles/heroContent";
import { getProducts, getCategories } from "../fetch";

export default async function Home ({searchParams}:{searchParams: Promise<{ [key: string]: string | string[]}>}) {

    const resolvedSearchParams = await searchParams
    const pageNumber = parseInt(resolvedSearchParams.page as string) || 1
    const PER_PAGE = 12

    // Get filter parameters
    const categories = Array.isArray(resolvedSearchParams.category) 
      ? resolvedSearchParams.category 
      : resolvedSearchParams.category 
      ? [resolvedSearchParams.category] 
      : [];
    const sortParam = resolvedSearchParams.sort as string;
    const lowPrice = resolvedSearchParams.lowPrice ? parseFloat(resolvedSearchParams.lowPrice as string) : undefined;
    const highPrice = resolvedSearchParams.highPrice ? parseFloat(resolvedSearchParams.highPrice as string) : undefined;

    // Fetch products with all filters applied at database level
    const allProducts = await getProducts({
      categories: categories.length > 0 ? categories : undefined,
      sort: sortParam,
      lowPrice,
      highPrice,
    });

    const categoriesList = await getCategories();

    // All filtering and sorting is now done at database level
    const filteredProducts = allProducts;

    const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE))

    // Paginate
    const paginatedProducts = filteredProducts.slice((pageNumber - 1) * PER_PAGE, pageNumber * PER_PAGE);

    return (
        <div>
        <Navbar navFix={false}/>
            <HeroImageSection slide={hero4} />
            <CollectionGrid 
                categoriesList={categoriesList}
                allProducts={paginatedProducts} 
                pageCount={pageCount} 
                page={pageNumber}
                pathname="/products"
            />
        <Footer/>
        </div>
    );
}
