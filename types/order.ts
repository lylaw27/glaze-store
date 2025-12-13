// Order Types matching Supabase schema

// Order status types
export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Order item from database
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

// Order item with product details (from API response)
export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    images: string; // JSON stringified array
  };
}

// Base order from database
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: OrderStatus;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Order with items (from API response)
export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

// Parsed order item for display (with parsed images)
export interface OrderItemDisplay {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    thumbnail: string;
    images: string[];
  };
}

// Order for display (with parsed data)
export interface OrderDisplay extends Order {
  items: OrderItemDisplay[];
}

// Order status colors for UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  confirmed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Order status labels (Chinese)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: '已確認',
  processing: '處理中',
  shipped: '已發貨',
  delivered: '已送達',
  cancelled: '已取消',
};
