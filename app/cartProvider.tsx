"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useSyncExternalStore } from "react";
import { Cart, CartItem, EMPTY_CART } from "@/types/cart";

const CART_STORAGE_KEY = "glaze_cart";

interface CartContextType {
  cart: Cart;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to save cart to localStorage
const saveCartToStorage = (cart: Cart) => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch a custom event for same-tab reactivity
    window.dispatchEvent(new StorageEvent("storage", { key: CART_STORAGE_KEY }));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Parse cart from string
const parseCart = (cartString: string | null): Cart => {
  if (!cartString) return EMPTY_CART;
  try {
    const parsed = JSON.parse(cartString);
    return {
      items: parsed.items || [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return EMPTY_CART;
  }
};

// Subscribe to storage events for cross-tab sync
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

// Get snapshot from localStorage
const getSnapshot = () => {
  return localStorage.getItem(CART_STORAGE_KEY);
};

// Server snapshot (always null)
const getServerSnapshot = () => {
  return null;
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for localStorage sync - returns raw string
  const cartString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  // Parse the cart (memoized based on string)
  const cart = parseCart(cartString);
  
  const [cartOpen, setCartOpen] = useState(false);

  // Helper to update cart and persist
  const updateCartState = useCallback((updater: Cart | ((prev: Cart) => Cart)) => {
    const currentCart = parseCart(localStorage.getItem(CART_STORAGE_KEY));
    const newCart = typeof updater === "function" ? updater(currentCart) : updater;
    saveCartToStorage(newCart);
  }, []);

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, "id">) => {
    updateCartState((prev) => {
      // Check if product already exists in cart
      const existingIndex = prev.items.findIndex(
        (i) => i.productId === item.productId
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Update quantity of existing item
        newItems = prev.items.map((i, index) =>
          index === existingIndex
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: generateId(),
        };
        newItems = [...prev.items, newItem];
      }

      return {
        items: newItems,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [updateCartState]);

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    updateCartState((prev) => ({
      items: prev.items.filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    }));
  }, [updateCartState]);

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      // Remove item if quantity is less than 1
      updateCartState((prev) => ({
        items: prev.items.filter((item) => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      }));
      return;
    }

    updateCartState((prev) => ({
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, [updateCartState]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    updateCartState({
      items: [],
      updatedAt: new Date().toISOString(),
    });
  }, [updateCartState]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart.items]);

  // Get total item count
  const getCartItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
