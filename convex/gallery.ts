import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./helpers";

// ---------------------------------------------------------------------------
// Central image gallery. Admins bulk-upload (client-compressed) images, then
// pick them in the product form. Gallery rows own the underlying storage files,
// so deleting a gallery image deletes the file and detaches it from products.
// ---------------------------------------------------------------------------

// All gallery images, newest-first (admin-only). Refreshes URLs defensively.
export const list = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const rows = await ctx.db.query("galleryImages").collect();
    rows.sort((a, b) => b._creationTime - a._creationTime);
    return await Promise.all(
      rows.map(async (row) => ({
        id: row._id,
        storageId: row.storageId,
        url: (await ctx.storage.getUrl(row.storageId)) ?? row.url,
        name: row.name,
        size: row.size,
        width: row.width ?? null,
        height: row.height ?? null,
        createdAt: row._creationTime,
      }))
    );
  },
});

// Insert one or more uploaded files as gallery rows (admin-only).
export const bulkAdd = mutation({
  args: {
    secret: v.string(),
    images: v.array(
      v.object({
        storageId: v.id("_storage"),
        name: v.string(),
        size: v.number(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const now = Date.now();
    const ids = [];
    for (const img of args.images) {
      const url = await ctx.storage.getUrl(img.storageId);
      if (!url) continue; // upload failed / file missing — skip
      ids.push(
        await ctx.db.insert("galleryImages", {
          storageId: img.storageId,
          url,
          name: img.name,
          size: img.size,
          width: img.width,
          height: img.height,
          updatedAt: now,
        })
      );
    }
    return { ids };
  },
});

// Delete a gallery image: detach it from any products that reference it, delete
// the underlying storage file, then delete the gallery row (admin-only).
export const remove = mutation({
  args: { secret: v.string(), id: v.id("galleryImages") },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    const row = await ctx.db.get(args.id);
    if (!row) return;

    // Detach from every product whose images array references this storage id.
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      if (product.images.some((img) => img.storageId === row.storageId)) {
        await ctx.db.patch(product._id, {
          images: product.images.filter(
            (img) => img.storageId !== row.storageId
          ),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.storage.delete(row.storageId);
    await ctx.db.delete(args.id);
  },
});
