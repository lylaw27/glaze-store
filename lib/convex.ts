// Server-side helpers for talking to Convex from Next.js route handlers and server actions.
// Every call here runs on the server; `fetchQuery`/`fetchMutation` use NEXT_PUBLIC_CONVEX_URL.
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/** Shared secret that authorizes write/admin Convex mutations (see convex/helpers.ts). */
export function adminSecret(): string {
  const secret = process.env.ADMIN_WRITE_SECRET;
  if (!secret) {
    throw new Error("ADMIN_WRITE_SECRET is not set in the server environment");
  }
  return secret;
}

/**
 * Upload a single file to Convex file storage and return its storage id.
 * Mirrors the documented flow: get a short-lived upload URL, POST the bytes, read storageId.
 */
export async function uploadImageToConvex(file: File): Promise<Id<"_storage">> {
  const uploadUrl = await fetchMutation(api.files.generateUploadUrl, {
    secret: adminSecret(),
  });

  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!result.ok) {
    throw new Error(`Failed to upload image to Convex storage: ${result.status}`);
  }

  const { storageId } = (await result.json()) as { storageId: string };
  return storageId as Id<"_storage">;
}
