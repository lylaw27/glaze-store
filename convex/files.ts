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
