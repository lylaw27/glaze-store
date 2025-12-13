// ============================================================================
// CORE TYPES
// ============================================================================

// Product status type
export type ProductStatus = 'active' | 'hidden';

// Category
export interface Category {
  id: string;
  name: string;
  type: string;
  handle?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product Category relationship
export interface ProductCategory {
  id: string;
  productId?: string;
  categoryId?: string;
  category: Category;
}

// Variant option structure (values as array)
export interface VariantOption {
  name: string;
  values: string[];
}

// Variant option for forms (values as comma-separated string)
export interface VariantOptionForm {
  name: string;
  values: string;
}

// Product variant
export interface ProductVariant {
  id: string;
  productId?: string;
  options: VariantOption[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Product add-on relationship
export interface ProductAddOn {
  id: string;
  mainProductId?: string;
  addOnProductId?: string;
  addOnProduct: {
    id: string;
    name: string;
    handle?: string;
    description?: string | null;
    price?: number;
    stock?: number;
    status?: string;
    images?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  createdAt?: Date;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

// Base product interface
export interface Product {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  stock: number;
  status: string;
  images: string; // JSON stringified array of image URLs
  categories?: ProductCategory[];
  variants?: ProductVariant[];
  addOns?: ProductAddOn[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// UI/FORM HELPER TYPES
// ============================================================================

// Image item for forms with file handling
export interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
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
  variants?: ProductVariant[];
  addOns?: ProductAddOn[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to parse product fields
export function parseProduct(product: Product): ProductWithParsedFields {
  const categoriesStr = typeof product.categories === 'string' ? product.categories : JSON.stringify(product.categories || []);
  return {
    ...product,
    status: product.status as ProductStatus,
    images: JSON.parse(product.images || "[]"),
    categories: JSON.parse(categoriesStr || "[]"),
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date(),
  };
}

// Helper function to parse multiple products
export function parseProducts(products: Product[]): ProductWithParsedFields[] {
  return products.map(parseProduct);
}
