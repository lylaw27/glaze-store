// Product status type
export type ProductStatus = 'active' | 'hidden';

// Variant option structure
export interface VariantOption {
  name: string;
  values: string[];
}

// Product variant
export interface ProductVariant {
  id: string;
  productId: string;
  options: VariantOption[]; // Parsed from JSON
  createdAt: Date;
  updatedAt: Date;
}

// Product add-on relationship
export interface ProductAddOn {
  id: string;
  mainProductId: string;
  addOnProductId: string;
  addOnProduct?: Product; // Optional populated add-on product
  createdAt: Date;
}

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
  status: ProductStatus;
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
  status: ProductStatus;
  variants?: ProductVariant;
  addOns?: ProductAddOn[];
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
