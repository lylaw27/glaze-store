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
  category?: string;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) {
    params.append("limit", options.limit.toString());
  }
  if (options?.search) {
    params.append("search", options.search);
  }
  if (options?.category) {
    params.append("category", options.category);
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
  const groupedCategories: Record<string, Array<{ id: string; name: string }>> = {};
  
  categories.forEach((category: { id: string; name: string; type: string }) => {
    if (!groupedCategories[category.type]) {
      groupedCategories[category.type] = [];
    }
    groupedCategories[category.type].push({
      id: category.id,
      name: category.name,
    });
  });

  return groupedCategories;
}