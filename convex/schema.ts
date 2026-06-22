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
    // Each image references a stored file (owned by the gallery) plus its served URL.
    // The array order is authoritative for the storefront image showcase.
    images: v.array(
      v.object({ storageId: v.id("_storage"), url: v.string() })
    ),
    // Admin-controlled sort order for the storefront showcase / default listing.
    // Optional so existing rows validate; backfillPositions assigns values once.
    position: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_handle", ["handle"])
    .index("by_status", ["status"])
    .index("by_position", ["position"]),

  // Central image library. Admins bulk-upload (client-compressed) images here, then pick
  // them in the product form. Gallery rows own the underlying storage files.
  galleryImages: defineTable({
    storageId: v.id("_storage"),
    url: v.string(),
    name: v.string(), // original filename
    size: v.number(), // bytes after compression
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_storage", ["storageId"]),

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
