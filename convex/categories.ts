import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, toIso } from "./helpers";

// All categories ordered by name, each with a product count (matches old /api/categories GET).
export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").withIndex("by_name").collect();
    const out = [];
    for (const cat of categories) {
      const pcs = await ctx.db
        .query("productCategories")
        .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
        .collect();
      out.push({
        id: cat._id,
        name: cat.name,
        handle: cat.handle,
        type: cat.type,
        createdAt: toIso(cat._creationTime),
        updatedAt: toIso(cat.updatedAt),
        _count: { products: pcs.length },
      });
    }
    return out;
  },
});

export const create = mutation({
  args: { secret: v.string(), name: v.string(), handle: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const handle = args.handle.trim().toLowerCase();
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .first();
    if (existing) throw new Error("DUPLICATE");

    const now = Date.now();
    const id = await ctx.db.insert("categories", {
      name: args.name.trim(),
      handle,
      type: args.type.trim(),
      updatedAt: now,
    });
    const cat = (await ctx.db.get(id))!;
    return {
      id: cat._id,
      name: cat.name,
      handle: cat.handle,
      type: cat.type,
      createdAt: toIso(cat._creationTime),
      updatedAt: toIso(cat.updatedAt),
    };
  },
});

export const update = mutation({
  args: {
    secret: v.string(),
    id: v.id("categories"),
    name: v.string(),
    handle: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const handle = args.handle.trim().toLowerCase();
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .first();
    if (existing && existing._id !== args.id) throw new Error("DUPLICATE");

    const cur = await ctx.db.get(args.id);
    if (!cur) throw new Error("NOT_FOUND");

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      handle,
      type: args.type.trim(),
      updatedAt: Date.now(),
    });
    const cat = (await ctx.db.get(args.id))!;
    return {
      id: cat._id,
      name: cat.name,
      handle: cat.handle,
      type: cat.type,
      createdAt: toIso(cat._creationTime),
      updatedAt: toIso(cat.updatedAt),
    };
  },
});

export const remove = mutation({
  args: { secret: v.string(), id: v.id("categories") },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const cat = await ctx.db.get(args.id);
    if (!cat) throw new Error("NOT_FOUND");

    const pcs = await ctx.db
      .query("productCategories")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();
    if (pcs.length > 0) throw new Error(`IN_USE:${pcs.length}`);

    await ctx.db.delete(args.id);
  },
});
