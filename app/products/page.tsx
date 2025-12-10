import Navbar from "../components/navbar"; 
import Footer from "../components/footer";
import CollectionGrid from "../components/collection-grid";
import HeroImageSection from "../components/hero-image-section";
import { hero4 } from "../jsonFiles/heroContent";
import { getProducts, getCategories } from "../fetch";

export default async function Home ({searchParams}:{searchParams: Promise<{ [key: string]: string}>}) {

    const resolvedSearchParams = await searchParams
    const pageNumber = parseInt(resolvedSearchParams.page) || 1
    const PER_PAGE = 12

    const products = await getProducts();

    const categoriesList = await getCategories();

    const pageCount = Math.max(1, Math.ceil(products.length / PER_PAGE))

    return (
        <div>
        <Navbar navFix={false}/>
            <HeroImageSection slide={hero4} />
            <CollectionGrid 
                categoriesList={categoriesList}
                allProducts={products} 
                pageCount={pageCount} 
                page={pageNumber}
                pathname="/collections"
            />
        <Footer/>
        </div>
    );
}
