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

const URL_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const URL_IMAGE_TIMEOUT_MS = 15_000;

/**
 * Download an image from a public URL and store it in Convex file storage.
 * Runs on the server so arbitrary image hosts aren't blocked by browser CORS.
 * Throws with a short, user-facing reason on failure.
 */
export async function importImageFromUrl(
  url: string
): Promise<{ storageId: Id<"_storage">; name: string; size: number }> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(URL_IMAGE_TIMEOUT_MS) });
  } catch (err) {
    throw new Error(
      err instanceof Error && err.name === "TimeoutError" ? "timed out" : "request failed"
    );
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!type.startsWith("image/")) throw new Error(`not an image (${type || "unknown type"})`);
  if (Number(res.headers.get("content-length")) > URL_IMAGE_MAX_BYTES) {
    throw new Error("larger than 10 MB");
  }
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > URL_IMAGE_MAX_BYTES) throw new Error("larger than 10 MB");

  let name = "image-from-url";
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (last) name = decodeURIComponent(last);
  } catch {}

  const storageId = await uploadImageToConvex(new File([bytes], name, { type }));
  return { storageId, name, size: bytes.byteLength };
}
