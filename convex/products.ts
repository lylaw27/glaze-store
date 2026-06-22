import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { assertAdmin, toIso } from "./helpers";

const variantOptionsValidator = v.array(
  v.object({ name: v.string(), values: v.array(v.string()) })
);

// Sort by admin-assigned position ascending; un-positioned rows fall to the end,
// tiebroken newest-first. Used for the storefront default order and admin list.
function byPosition(a: Doc<"products">, b: Doc<"products">): number {
  const pa = a.position ?? Number.MAX_SAFE_INTEGER;
  const pb = b.position ?? Number.MAX_SAFE_INTEGER;
  if (pa !== pb) return pa - pb;
  return b._creationTime - a._creationTime;
}

// ---------------------------------------------------------------------------
// Shaping helpers — return the exact JSON shapes the existing consumers expect.
// ---------------------------------------------------------------------------

// Storefront shape (matches the old /api/products GET output).
async function shapeStorefront(ctx: QueryCtx, product: Doc<"products">) {
  const pcs = await ctx.db
    .query("productCategories")
    .withIndex("by_product", (q) => q.eq("productId", product._id))
    .collect();
  const categoryHandles: string[] = [];
  for (const pc of pcs) {
    const cat = await ctx.db.get(pc.categoryId);
    if (cat) categoryHandles.push(cat.handle);
  }

  const variants = await ctx.db
    .query("productVariants")
    .withIndex("by_product", (q) => q.eq("productId", product._id))
    .collect();
  const variant =
    variants.length > 0
      ? {
          id: variants[0]._id,
          productId: product._id,
          options: variants[0].options,
          createdAt: toIso(variants[0]._creationTime),
          updatedAt: toIso(variants[0].updatedAt),
        }
      : null;

  const addOnRows = await ctx.db
    .query("productAddOns")
    .withIndex("by_main", (q) => q.eq("mainProductId", product._id))
    .collect();
  const addOns = [];
  for (const ao of addOnRows) {
    const ap = await ctx.db.get(ao.addOnProductId);
    if (!ap) continue;
    addOns.push({
      id: ao._id,
      mainProductId: product._id,
      addOnProductId: ap._id,
      createdAt: toIso(ao._creationTime),
      addOnProduct: {
        id: ap._id,
        name: ap.name,
        handle: ap.handle,
        description: ap.description ?? null,
        price: ap.price,
        stock: ap.stock,
        status: ap.status,
        createdAt: toIso(ap._creationTime),
        updatedAt: toIso(ap.updatedAt),
        images: ap.images.map((i) => i.url),
      },
    });
  }

  return {
    id: product._id,
    name: product.name,
    handle: product.handle,
    description: product.description ?? null,
    price: product.price,
    stock: product.stock,
    status: product.status,
    createdAt: toIso(product._creationTime),
    updatedAt: toIso(product.updatedAt),
    images: product.images.map((i) => i.url),
    categories: categoryHandles,
    variants: variant,
    addOns,
  };
}

// Admin shape (matches the old admin getProducts() output: nested categories with the
// full category object, variants array with parsed options, addOns array, and `images`
// as a JSON string so ProductForm/ProductList keep using JSON.parse(product.images)).
async function shapeAdmin(ctx: QueryCtx, product: Doc<"products">) {
  const pcs = await ctx.db
    .query("productCategories")
    .withIndex("by_product", (q) => q.eq("productId", product._id))
    .collect();
  const categories = [];
  for (const pc of pcs) {
    const cat = await ctx.db.get(pc.categoryId);
    if (!cat) continue;
    categories.push({
      id: pc._id,
      productId: product._id,
      categoryId: cat._id,
      category: {
        id: cat._id,
        name: cat.name,
        type: cat.type,
        handle: cat.handle,
        createdAt: toIso(cat._creationTime),
        updatedAt: toIso(cat.updatedAt),
      },
    });
  }

  const variantDocs = await ctx.db
    .query("productVariants")
    .withIndex("by_product", (q) => q.eq("productId", product._id))
    .collect();
  const variants = variantDocs.map((vd) => ({
    id: vd._id,
    productId: product._id,
    options: vd.options,
    createdAt: toIso(vd._creationTime),
    updatedAt: toIso(vd.updatedAt),
  }));

  const addOnRows = await ctx.db
    .query("productAddOns")
    .withIndex("by_main", (q) => q.eq("mainProductId", product._id))
    .collect();
  const addOns = [];
  for (const ao of addOnRows) {
    const ap = await ctx.db.get(ao.addOnProductId);
    if (!ap) continue;
    addOns.push({
      id: ao._id,
      mainProductId: product._id,
      addOnProductId: ap._id,
      createdAt: toIso(ao._creationTime),
      addOnProduct: {
        id: ap._id,
        name: ap.name,
        handle: ap.handle,
        description: ap.description ?? null,
        price: ap.price,
        stock: ap.stock,
        status: ap.status,
        // Admin shape keeps the full {storageId, url} objects so the form can
        // reorder images and reference the gallery files they came from.
        images: JSON.stringify(ap.images),
        createdAt: toIso(ap._creationTime),
        updatedAt: toIso(ap.updatedAt),
      },
    });
  }

  return {
    id: product._id,
    name: product.name,
    handle: product.handle,
    description: product.description ?? null,
    price: product.price,
    stock: product.stock,
    status: product.status,
    images: JSON.stringify(product.images),
    createdAt: toIso(product._creationTime),
    updatedAt: toIso(product.updatedAt),
    categories,
    variants,
    addOns,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

// Storefront product list with the same filters/sorting as the old route.
export const list = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    handle: v.optional(v.string()),
    categories: v.optional(v.array(v.string())), // category handles
    sort: v.optional(v.string()),
    lowPrice: v.optional(v.number()),
    highPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    products = products.filter((p) => p.stock > 0);

    if (args.handle) products = products.filter((p) => p.handle === args.handle);
    if (args.lowPrice !== undefined)
      products = products.filter((p) => p.price >= args.lowPrice!);
    if (args.highPrice !== undefined)
      products = products.filter((p) => p.price <= args.highPrice!);
    if (args.search) {
      const s = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.description ?? "").toLowerCase().includes(s)
      );
    }

    if (args.sort === "price-asc") products.sort((a, b) => a.price - b.price);
    else if (args.sort === "price-desc") products.sort((a, b) => b.price - a.price);
    else products.sort(byPosition); // default / "featured" = admin drag order

    let shaped = await Promise.all(products.map((p) => shapeStorefront(ctx, p)));

    if (args.categories && args.categories.length > 0) {
      shaped = shaped.filter((p) =>
        p.categories.some((h) => args.categories!.includes(h))
      );
    }
    if (args.limit !== undefined) shaped = shaped.slice(0, args.limit);
    return shaped;
  },
});

// Lookup by ids — used by cart validation and order creation (replaces `.in("id", ...)`).
// Accepts plain strings and normalizes them so stale/invalid cart ids don't throw.
export const getByIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const out = [];
    for (const idStr of args.ids) {
      const id = ctx.db.normalizeId("products", idStr);
      if (!id) continue;
      const p = await ctx.db.get(id);
      if (!p) continue;
      out.push({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        status: p.status,
        images: p.images.map((i) => i.url),
      });
    }
    return out;
  },
});

// Single storefront product by id (matches old /api/products/[id] GET).
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("products", args.id);
    if (!id) return null;
    const p = await ctx.db.get(id);
    if (!p) return null;
    return await shapeStorefront(ctx, p);
  },
});

// All products newest-first in the nested admin shape (admin-only).
export const listForAdmin = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const products = await ctx.db.query("products").collect();
    products.sort(byPosition);
    return await Promise.all(products.map((p) => shapeAdmin(ctx, p)));
  },
});

// ---------------------------------------------------------------------------
// Mutations (write-protected)
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    secret: v.string(),
    name: v.string(),
    handle: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    stock: v.number(),
    status: v.string(),
    imageStorageIds: v.array(v.id("_storage")),
    categoryIds: v.array(v.id("categories")),
    variantOptions: variantOptionsValidator,
    addOnProductIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const now = Date.now();

    // Images are gallery files chosen in the form; keep the given order.
    const images = [];
    for (const storageId of args.imageStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) images.push({ storageId, url });
    }

    // Append to the end of the admin sort order.
    const all = await ctx.db.query("products").collect();
    const maxPosition = all.reduce(
      (max, p) => Math.max(max, p.position ?? -1),
      -1
    );

    const productId = await ctx.db.insert("products", {
      name: args.name,
      handle: args.handle,
      description: args.description,
      price: args.price,
      stock: args.stock,
      status: args.status,
      images,
      position: maxPosition + 1,
      updatedAt: now,
    });

    for (const categoryId of args.categoryIds) {
      await ctx.db.insert("productCategories", { productId, categoryId });
    }
    if (args.variantOptions.length > 0) {
      await ctx.db.insert("productVariants", {
        productId,
        options: args.variantOptions,
        updatedAt: now,
      });
    }
    for (const addOnProductId of args.addOnProductIds) {
      await ctx.db.insert("productAddOns", { mainProductId: productId, addOnProductId });
    }

    return { id: productId };
  },
});

export const update = mutation({
  args: {
    secret: v.string(),
    id: v.id("products"),
    name: v.string(),
    handle: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    stock: v.number(),
    status: v.string(),
    imageStorageIds: v.array(v.id("_storage")), // full ordered image set
    categoryIds: v.array(v.id("categories")),
    variantOptions: variantOptionsValidator,
    addOnProductIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const now = Date.now();
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    // The form sends the full desired image set in order (gallery files). Rebuild
    // the array from it; do NOT delete storage — the gallery owns those files.
    const images = [];
    for (const storageId of args.imageStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) images.push({ storageId, url });
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      handle: args.handle,
      description: args.description,
      price: args.price,
      stock: args.stock,
      status: args.status,
      images,
      updatedAt: now,
    });

    // Replace category links.
    const existingPcs = await ctx.db
      .query("productCategories")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();
    for (const pc of existingPcs) await ctx.db.delete(pc._id);
    for (const categoryId of args.categoryIds) {
      await ctx.db.insert("productCategories", { productId: args.id, categoryId });
    }

    // Upsert/delete the single variant row.
    const existingVariants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();
    if (args.variantOptions.length > 0) {
      if (existingVariants.length > 0) {
        await ctx.db.patch(existingVariants[0]._id, {
          options: args.variantOptions,
          updatedAt: now,
        });
        for (let i = 1; i < existingVariants.length; i++) {
          await ctx.db.delete(existingVariants[i]._id);
        }
      } else {
        await ctx.db.insert("productVariants", {
          productId: args.id,
          options: args.variantOptions,
          updatedAt: now,
        });
      }
    } else {
      for (const vd of existingVariants) await ctx.db.delete(vd._id);
    }

    // Replace add-on links.
    const existingAddOns = await ctx.db
      .query("productAddOns")
      .withIndex("by_main", (q) => q.eq("mainProductId", args.id))
      .collect();
    for (const ao of existingAddOns) await ctx.db.delete(ao._id);
    for (const addOnProductId of args.addOnProductIds) {
      await ctx.db.insert("productAddOns", { mainProductId: args.id, addOnProductId });
    }
  },
});

export const remove = mutation({
  args: { secret: v.string(), id: v.id("products") },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const product = await ctx.db.get(args.id);
    if (!product) return;

    // Images are gallery-owned files; deleting the product only drops the links.

    const pcs = await ctx.db
      .query("productCategories")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();
    for (const pc of pcs) await ctx.db.delete(pc._id);

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();
    for (const vd of variants) await ctx.db.delete(vd._id);

    const addOnsAsMain = await ctx.db
      .query("productAddOns")
      .withIndex("by_main", (q) => q.eq("mainProductId", args.id))
      .collect();
    for (const ao of addOnsAsMain) await ctx.db.delete(ao._id);

    // Also drop links where this product is referenced as an add-on of others.
    const allAddOns = await ctx.db.query("productAddOns").collect();
    for (const ao of allAddOns) {
      if (ao.addOnProductId === args.id) await ctx.db.delete(ao._id);
    }

    await ctx.db.delete(args.id);
  },
});

// Persist a new admin drag order: each id's array index becomes its position.
export const reorder = mutation({
  args: { secret: v.string(), orderedIds: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { position: i });
    }
  },
});

// One-time: assign sequential positions to any products that lack one, using the
// previous newest-first order. Safe to re-run. Invoke via `npx convex run`.
export const backfillPositions = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const products = await ctx.db.query("products").collect();
    products.sort(byPosition); // already-positioned rows keep their relative order
    for (let i = 0; i < products.length; i++) {
      if (products[i].position !== i) {
        await ctx.db.patch(products[i]._id, { position: i });
      }
    }
    return { updated: products.length };
  },
});
