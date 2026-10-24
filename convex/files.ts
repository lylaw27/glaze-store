import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./helpers";

// Returns a short-lived upload URL. The caller POSTs the file bytes to it and gets back
// a { storageId } which is then passed to products.create / products.update.
export const generateUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    return await ctx.storage.generateUploadUrl();
  },
});

// Deletes uploaded files that were never attached to anything (e.g. an aborted import).
export const deleteFiles = mutation({
  args: { secret: v.string(), storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    assertAdmin(args.secret);
    for (const id of args.storageIds) await ctx.storage.delete(id);
  },
});
