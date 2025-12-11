//Get product list according to collections

// Helper to get base URL for API calls
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use relative URL
    return "";
  }
  // Server-side: use absolute URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Fallback for local development
  return `http://localhost:${process.env.PORT || 3000}`;
};

//Get all products
export async function getProducts(options?: {
  limit?: number;
  search?: string;
  categories?: string[];
  sort?: string;
  lowPrice?: number;
  highPrice?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) {
    params.append("limit", options.limit.toString());
  }
  if (options?.search) {
    params.append("search", options.search);
  }
  if (options?.categories && options.categories.length > 0) {
    options.categories.forEach(cat => {
      params.append("category", cat);
    });
  }
  if (options?.sort) {
    params.append("sort", options.sort);
  }
  if (options?.lowPrice !== undefined) {
    params.append("lowPrice", options.lowPrice.toString());
  }
  if (options?.highPrice !== undefined) {
    params.append("highPrice", options.highPrice.toString());
  }

  const queryString = params.toString();
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/products${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

//Get all categories grouped by type
export async function getCategories() {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/categories`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories = await response.json();
  
  // Group categories by type
  const groupedCategories: Record<string, Array<{ handle: string; name: string }>> = {};
  
  categories.forEach((category: { id: string; name: string; handle: string; type: string }) => {
    if (!groupedCategories[category.type]) {
      groupedCategories[category.type] = [];
    }
    groupedCategories[category.type].push({
      handle: category.handle,
      name: category.name,
    });
  });

  return groupedCategories;
}

//Get single product by handle
export async function getProductByHandle(handle: string) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/products?handle=${handle}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const products = await response.json();
  return products[0] || null;
}