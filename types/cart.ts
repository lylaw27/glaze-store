import { ProductWithParsedFields } from "./product";

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variants?: Record<string, string>; // e.g., { "Size": "M", "Color": "Red" }
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

export const EMPTY_CART: Cart = {
  items: [],
  updatedAt: new Date().toISOString(),
};
