import type { GalleryImage, Product, ProductImageRef, VariantOption } from "@/types/product";
import { isValidImageUrl, looksLikeUrl } from "./imageUrl";

// ---------------------------------------------------------------------------
// Admin product CSV format. One row per product; multi-value cells use "|".
//   categories: category handles      e.g. "vases|new-arrivals"
//   images:     gallery image names or https image URLs (saved as-is; invalid or
//               non-image URLs are skipped)  e.g. "vase1.jpg|https://x.com/a.png"
//   variants:   Name:v1,v2|Name:v1    e.g. "Size:S,M,L|Color:Blue,Green"
//   add_ons:    product handles       e.g. "gift-box|stand"
// Export and import both go through this file so the two stay symmetric.
// ---------------------------------------------------------------------------

export const CSV_COLUMNS = [
  "handle",
  "name",
  "description",
  "price",
  "stock",
  "status",
  "categories",
  "images",
  "variants",
  "add_ons",
] as const;

const REQUIRED_COLUMNS = ["handle", "name", "price", "stock"] as const;
export const MAX_IMPORT_ROWS = 500;

export type CsvRecord = Record<(typeof CSV_COLUMNS)[number], string>;

// Shape sent to api.products.importCsv.
export interface ImportRow {
  line: number;
  handle: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: string;
  categoryHandles: string[];
  images: string[]; // gallery image names and/or image URLs, in display order
  variantOptions: VariantOption[];
  addOnHandles: string[];
}

export interface RowError {
  line: number;
  message: string;
}

export function splitMulti(cell: string | undefined): string[] {
  return (cell ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatVariants(options: VariantOption[]): string {
  return options.map((o) => `${o.name}:${o.values.join(",")}`).join("|");
}

// Returns null when the cell isn't valid "Name:v1,v2|Name:v1" syntax.
export function parseVariants(cell: string | undefined): VariantOption[] | null {
  const options: VariantOption[] = [];
  for (const part of splitMulti(cell)) {
    const idx = part.indexOf(":");
    if (idx <= 0) return null;
    const name = part.slice(0, idx).trim();
    const values = part
      .slice(idx + 1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!name || values.length === 0) return null;
    options.push({ name, values });
  }
  return options;
}

export function productsToCsvRecords(
  products: Product[],
  galleryImages: GalleryImage[]
): CsvRecord[] {
  const nameByStorageId = new Map(galleryImages.map((g) => [g.storageId, g.name]));
  return products.map((p) => {
    let images: ProductImageRef[] = [];
    try {
      images = JSON.parse(p.images || "[]");
    } catch {}
    return {
      handle: p.handle,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stock: String(p.stock),
      status: p.status,
      categories: (p.categories ?? [])
        .map((c) => c.category.handle)
        .filter(Boolean)
        .join("|"),
      images: images
        .map((i) => (i.storageId ? nameByStorageId.get(i.storageId) : i.url))
        .filter(Boolean)
        .join("|"),
      variants: formatVariants(p.variants?.[0]?.options ?? []),
      add_ons: (p.addOns ?? [])
        .map((a) => a.addOnProduct.handle)
        .filter(Boolean)
        .join("|"),
    };
  });
}

// Validates parsed CSV records (header keys already lower-cased) and converts
// them to import rows. Line numbers match the spreadsheet (header = line 1).
export function recordsToImportRows(
  records: Record<string, string>[],
  headers: string[]
): { rows: ImportRow[]; errors: RowError[] } {
  const errors: RowError[] = [];
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [{ line: 1, message: `missing required column(s): ${missing.join(", ")}` }],
    };
  }
  if (records.length > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      errors: [{ line: 1, message: `too many rows (max ${MAX_IMPORT_ROWS} per import)` }],
    };
  }

  const rows: ImportRow[] = [];
  records.forEach((r, i) => {
    const line = i + 2;
    const err = (message: string) => errors.push({ line, message });
    const get = (key: string) => (r[key] ?? "").trim();

    const handle = get("handle");
    const name = get("name");
    const price = Number(get("price"));
    const stock = Number(get("stock"));
    const status = get("status").toLowerCase() || "active";
    const variantOptions = parseVariants(get("variants"));

    if (!handle) err("handle is required");
    if (!name) err("name is required");
    if (get("price") === "" || !Number.isFinite(price) || price < 0) {
      err(`invalid price "${get("price")}"`);
    }
    if (get("stock") === "" || !Number.isInteger(stock) || stock < 0) {
      err(`invalid stock "${get("stock")}" (must be a whole number)`);
    }
    if (status !== "active" && status !== "hidden") {
      err(`invalid status "${status}" (use active or hidden)`);
    }
    if (variantOptions === null) {
      err(`invalid variants "${get("variants")}" (use Name:v1,v2|Name:v1)`);
    }

    const description = get("description");
    rows.push({
      line,
      handle,
      name,
      description: description || undefined,
      price,
      stock,
      status,
      categoryHandles: splitMulti(get("categories")),
      images: [
        ...new Set(
          splitMulti(get("images")).filter((e) => !looksLikeUrl(e) || isValidImageUrl(e))
        ),
      ],
      variantOptions: variantOptions ?? [],
      addOnHandles: splitMulti(get("add_ons")),
    });
  });

  return { rows, errors };
}
