// Shared by the CSV import (client) and convex/products.ts, so keep it dependency-free.

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "avif", "svg", "bmp", "tif", "tiff", "ico", "heic",
]);

// True when a CSV image entry is meant as a URL rather than a gallery image name.
export function looksLikeUrl(entry: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(entry) || /^www\./i.test(entry);
}

// True for an https URL whose path has no extension or an image extension.
// Anything else (bad syntax, http, .pdf/.html/...) is not usable as a product image.
export function isValidImageUrl(entry: string): boolean {
  let url: URL;
  try {
    url = new URL(entry);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const last = url.pathname.split("/").pop() ?? "";
  const dot = last.lastIndexOf(".");
  return dot === -1 || IMAGE_EXTENSIONS.has(last.slice(dot + 1).toLowerCase());
}
