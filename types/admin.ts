// Admin Product Types
// Re-using core types from product.ts to avoid duplication

import type { 
  Category, 
  ProductCategory,
  VariantOption,
  ProductVariant,
  ProductAddOn,
  Product
} from "./product";

// Type aliases for admin context (same structure, different semantic meaning)
export type AdminCategory = Category;
export type AdminProductCategory = ProductCategory;
export type AdminVariantOption = VariantOption;
export type AdminProductVariant = ProductVariant;
export type AdminProductAddOn = ProductAddOn;
export type AdminProduct = Product;

// Product query result from Supabase
export interface AdminProductQueryResult {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  stock: number;
  status: string;
  images: string;
  createdAt: Date;
  updatedAt: Date;
  categories: Array<{
    id: string;
    productId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      type: string;
      handle: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  variants?: Array<{
    id: string;
    productId: string;
    options: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  addOns?: Array<{
    id: string;
    mainProductId: string;
    addOnProductId: string;
    addOnProduct: {
      id: string;
      name: string;
      handle: string;
      description: string | null;
      price: number;
      stock: number;
      status: string;
      images: string;
      createdAt: Date;
      updatedAt: Date;
    };
    createdAt: Date;
  }>;
}

// Form data types for server actions
export interface ProductFormData {
  name: string;
  handle: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  categoryIds: string[];
  variantOptions: string;
  addOnProductIds: string[];
  newImageCount: number;
  existingImages?: string[];
  removedImages?: string[];
}

export interface CreateProductData extends ProductFormData {
  imageUrls: string[];
}

export interface UpdateProductData extends ProductFormData {
  id: string;
  allImages: string[];
}
