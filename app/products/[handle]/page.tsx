import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ProductDetail from "../../components/product-detail";
import { getProductByHandle } from "../../fetch";

export default async function ProductPage ({
    params
  }:{
    params: Promise<{ handle: string }>
  }) {
  
  const {handle} = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    return (
      <div>
        <Navbar navFix={true}/>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">產品未找到</h1>
          <a href="/products" className="text-blue-600 hover:underline">
            返回商品列表
          </a>
        </div>
        <Footer/>
      </div>
    );
  }

  console.log(product)

  return (
      <div>
        <Navbar navFix={true}/>
        <ProductDetail product={product}/>
        <Footer/>
      </div>
  );
}