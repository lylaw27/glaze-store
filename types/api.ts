// API Response Types
// Re-using core types from product.ts to avoid duplication

import type { Category } from "./product";

// Category with product count for API responses
export interface CategoryWithCount extends Category {
  _count: {
    products: number;
  };
  products?: Array<{ count: number }>;
}

// Product variant with parsed options
export interface ProductVariantParsed {
  id: string;
  productId: string;
  options: Array<{
    name: string;
    values: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Product Add-on with nested product
export interface ProductAddOnWithProduct {
  id: string;
  mainProductId: string;
  addOnProductId: string;
  addOnProduct: {
    id: string;
    name: string;
    handle: string;
    description: string | null;
    price: number;
    images: string[];
    stock: number;
    status: 'active' | 'hidden';
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
}

// Product with images as JSON string (raw from DB)
export interface ProductRaw {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  images: string; // JSON stringified array
  stock: number;
  status: 'active' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

// Product with images parsed but categories still raw
export interface ProductWithParsedImages {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  status: 'active' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

// Product with all relations (used in API responses)
export interface ProductWithRelations {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  images: string[];
  categories: string[];
  stock: number;
  status: 'active' | 'hidden';
  variants: ProductVariantParsed | null;
  addOns: ProductAddOnWithProduct[];
  createdAt: Date;
  updatedAt: Date;
}

// Raw product from Supabase query (before parsing)
export interface ProductQueryResult {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  images: string;
  stock: number;
  status: 'active' | 'hidden';
  categories: Array<{ category: { handle: string } }>;
  variants: Array<{ id: string; productId: string; options: string; createdAt: Date; updatedAt: Date }> | null;
  addOns: Array<{ 
    id: string; 
    addOnProduct: {
      id: string;
      name: string;
      handle: string;
      description: string | null;
      price: number;
      images: string;
      stock: number;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Stripe Payment Intent types
export interface StripePaymentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface StripePaymentIntentRequest {
  items: StripePaymentItem[];
  amount: number;
}

export interface StripePaymentIntentResponse {
  clientSecret: string;
}

// Error response
export interface ApiError {
  error: string;
}
