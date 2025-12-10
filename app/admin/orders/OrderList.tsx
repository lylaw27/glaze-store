"use client";

import { useState } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  paymentId: string | null;
  createdAt: Date;
  items: OrderItem[];
}

interface OrderListProps {
  orders: Order[];
  updateStatusAction: (formData: FormData) => Promise<void>;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderList({
  orders,
  updateStatusAction,
}: OrderListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const formData = new FormData();
    formData.append("id", orderId);
    formData.append("status", newStatus);
    await updateStatusAction(formData);
    setUpdatingId(null);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-500">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() =>
              setExpandedId(expandedId === order.id ? null : order.id)
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </p>
                <select
                  value={order.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(order.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  disabled={updatingId === order.id}
                  className={`px-3 py-1 text-sm font-medium rounded-full border-0 cursor-pointer ${
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  } disabled:opacity-50`}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedId === order.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {expandedId === order.id && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Customer Details
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {order.customerName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.customerEmail}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {order.customerAddress}
                    </p>
                    {order.paymentId && (
                      <p>
                        <span className="font-medium">Payment ID:</span>{" "}
                        {order.paymentId}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
