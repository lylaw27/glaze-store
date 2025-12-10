// Product type matching the Prisma schema
export interface Product {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  images: string; // JSON stringified array of image URLs
  categories: string; // JSON stringified array of category strings
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Parsed product with images and categories as arrays
export interface ProductWithParsedFields {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  images: string[];
  categories: string[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to parse product fields
export function parseProduct(product: Product): ProductWithParsedFields {
  return {
    ...product,
    images: JSON.parse(product.images || "[]"),
    categories: JSON.parse(product.categories || "[]"),
  };
}

// Helper function to parse multiple products
export function parseProducts(products: Product[]): ProductWithParsedFields[] {
  return products.map(parseProduct);
}
