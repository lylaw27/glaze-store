import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Mirrors the app's previous Supabase schema (Product, Category, ProductCategory,
// ProductVariant, ProductAddOn, Order, OrderItem). Convex supplies `_id` and
// `_creationTime` automatically; `updatedAt` (ms) is kept explicit where the old code
// surfaced it. Foreign keys are `v.id(...)` references.
export default defineSchema({
  categories: defineTable({
    name: v.string(),
    handle: v.string(),
    type: v.string(),
    updatedAt: v.number(),
  })
    .index("by_handle", ["handle"])
    .index("by_name", ["name"]),

  products: defineTable({
    name: v.string(),
    handle: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    stock: v.number(),
    status: v.string(), // "active" | "hidden"
    // Each image keeps its storage id (for deletion) and served URL (for display).
    images: v.array(
      v.object({ storageId: v.id("_storage"), url: v.string() })
    ),
    updatedAt: v.number(),
  })
    .index("by_handle", ["handle"])
    .index("by_status", ["status"]),

  productCategories: defineTable({
    productId: v.id("products"),
    categoryId: v.id("categories"),
  })
    .index("by_product", ["productId"])
    .index("by_category", ["categoryId"]),

  productVariants: defineTable({
    productId: v.id("products"),
    options: v.array(
      v.object({ name: v.string(), values: v.array(v.string()) })
    ),
    updatedAt: v.number(),
  }).index("by_product", ["productId"]),

  productAddOns: defineTable({
    mainProductId: v.id("products"),
    addOnProductId: v.id("products"),
  }).index("by_main", ["mainProductId"]),

  orders: defineTable({
    customerName: v.string(),
    customerEmail: v.string(),
    customerAddress: v.string(),
    totalAmount: v.number(),
    status: v.string(), // confirmed | processing | shipped | delivered | cancelled
    paymentId: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_payment", ["paymentId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    price: v.number(),
  }).index("by_order", ["orderId"]),
});
