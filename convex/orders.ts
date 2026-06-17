import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { assertAdmin, toIso } from "./helpers";

// Order shape with items + product (matches the old `*, items:OrderItem(*, product:Product(*))`).
// `product.images` is kept as a JSON string because the email and confirmation page do
// JSON.parse(item.product.images).
async function shapeOrder(ctx: QueryCtx, order: Doc<"orders">) {
  const itemRows = await ctx.db
    .query("orderItems")
    .withIndex("by_order", (q) => q.eq("orderId", order._id))
    .collect();
  const items = [];
  for (const it of itemRows) {
    const p = await ctx.db.get(it.productId);
    // Always emit a product object so downstream consumers (email, confirmation page,
    // admin order list) never have to null-check. Falls back to a placeholder only if the
    // referenced product was deleted.
    const product = p
      ? {
          id: p._id as string,
          name: p.name,
          handle: p.handle,
          description: p.description ?? null,
          price: p.price,
          stock: p.stock,
          status: p.status,
          images: JSON.stringify(p.images.map((i) => i.url)),
          createdAt: toIso(p._creationTime),
          updatedAt: toIso(p.updatedAt),
        }
      : {
          id: it.productId as string,
          name: "Unknown product",
          handle: "",
          description: null,
          price: it.price,
          stock: 0,
          status: "hidden",
          images: "[]",
          createdAt: toIso(order._creationTime),
          updatedAt: toIso(order._creationTime),
        };
    items.push({
      id: it._id,
      orderId: order._id,
      productId: it.productId,
      quantity: it.quantity,
      price: it.price,
      product,
    });
  }

  return {
    id: order._id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerAddress: order.customerAddress,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentId: order.paymentId ?? null,
    createdAt: toIso(order._creationTime),
    updatedAt: toIso(order.updatedAt),
    items,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const list = query({
  args: { paymentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const orders = args.paymentId
      ? await ctx.db
          .query("orders")
          .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
          .collect()
      : await ctx.db.query("orders").collect();
    orders.sort((a, b) => b._creationTime - a._creationTime);
    return await Promise.all(orders.map((o) => shapeOrder(ctx, o)));
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("orders", args.id);
    if (!id) return null;
    const order = await ctx.db.get(id);
    if (!order) return null;
    return await shapeOrder(ctx, order);
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

// Customer checkout. Validates stock, inserts order + items, and decrements stock
// atomically (a single Convex transaction — an improvement over the old multi-step writes).
export const create = mutation({
  args: {
    secret: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerAddress: v.string(),
    paymentId: v.optional(v.string()),
    items: v.array(
      v.object({ productId: v.string(), quantity: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const resolved = [];
    for (const item of args.items) {
      const id = ctx.db.normalizeId("products", item.productId);
      const p = id ? await ctx.db.get(id) : null;
      if (!id || !p) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      if (p.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${p.name}`);
      resolved.push({ id, product: p, quantity: item.quantity });
    }

    const totalAmount = resolved.reduce(
      (sum, r) => sum + r.product.price * r.quantity,
      0
    );
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerAddress: args.customerAddress,
      paymentId: args.paymentId,
      totalAmount,
      status: "confirmed",
      updatedAt: now,
    });

    for (const r of resolved) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: r.id,
        quantity: r.quantity,
        price: r.product.price,
      });
      await ctx.db.patch(r.id, {
        stock: r.product.stock - r.quantity,
        updatedAt: now,
      });
    }

    return await shapeOrder(ctx, (await ctx.db.get(orderId))!);
  },
});

// Stripe webhook path: order is created from the payment intent metadata.
export const createFromPayment = mutation({
  args: {
    secret: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerAddress: v.string(),
    paymentId: v.string(),
    totalAmount: v.number(),
    items: v.array(
      v.object({
        productId: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const now = Date.now();
    const orderId = await ctx.db.insert("orders", {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerAddress: args.customerAddress,
      paymentId: args.paymentId,
      totalAmount: args.totalAmount,
      status: "confirmed",
      updatedAt: now,
    });

    for (const item of args.items) {
      const id = ctx.db.normalizeId("products", item.productId);
      const p = id ? await ctx.db.get(id) : null;
      if (!id || !p) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      await ctx.db.insert("orderItems", {
        orderId,
        productId: id,
        quantity: item.quantity,
        price: p.price,
      });
      await ctx.db.patch(id, {
        stock: p.stock - item.quantity,
        updatedAt: now,
      });
    }

    return await shapeOrder(ctx, (await ctx.db.get(orderId))!);
  },
});

export const updateStatus = mutation({
  args: { secret: v.string(), id: v.id("orders"), status: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});
