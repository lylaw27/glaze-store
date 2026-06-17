import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { adminSecret, uploadImageToConvex } from "@/lib/convex";
import type { Id } from "@/convex/_generated/dataModel";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import { AdminProduct } from "@/types";

async function getProducts(): Promise<AdminProduct[]> {
  const products = await fetchQuery(api.products.listForAdmin, {
    secret: adminSecret(),
  });
  return products as unknown as AdminProduct[];
}

export default async function ProductsPage() {
  const products = await getProducts();

  async function createProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const status = (formData.get("status") as string) || "active";
    const newImageCount = parseInt(formData.get("newImageCount") as string) || 0;
    const categoryIds = JSON.parse(
      (formData.get("categoryIds") as string) || "[]"
    ) as Id<"categories">[];
    const variantOptions = JSON.parse(
      (formData.get("variantOptions") as string) || "[]"
    ) as { name: string; values: string[] }[];
    const addOnProductIds = JSON.parse(
      (formData.get("addOnProductIds") as string) || "[]"
    ) as Id<"products">[];

    // Upload new images to Convex storage and collect their storage ids
    const imageStorageIds: Id<"_storage">[] = [];
    for (let i = 0; i < newImageCount; i++) {
      const imageFile = formData.get(`imageFile-${i}`) as File | null;
      if (imageFile && imageFile.size > 0) {
        imageStorageIds.push(await uploadImageToConvex(imageFile));
      }
    }

    await fetchMutation(api.products.create, {
      secret: adminSecret(),
      name,
      handle,
      description,
      price,
      stock,
      status,
      imageStorageIds,
      categoryIds,
      variantOptions,
      addOnProductIds,
    });

    revalidatePath("/admin/products");
  }

  async function updateProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as Id<"products">;
    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const status = (formData.get("status") as string) || "active";
    const newImageCount = parseInt(formData.get("newImageCount") as string) || 0;
    // URLs of existing images the user kept; the mutation deletes the dropped ones.
    const keepUrls = JSON.parse(
      (formData.get("existingImages") as string) || "[]"
    ) as string[];
    const categoryIds = JSON.parse(
      (formData.get("categoryIds") as string) || "[]"
    ) as Id<"categories">[];
    const variantOptions = JSON.parse(
      (formData.get("variantOptions") as string) || "[]"
    ) as { name: string; values: string[] }[];
    const addOnProductIds = JSON.parse(
      (formData.get("addOnProductIds") as string) || "[]"
    ) as Id<"products">[];

    // Upload newly added images to Convex storage
    const newImageStorageIds: Id<"_storage">[] = [];
    for (let i = 0; i < newImageCount; i++) {
      const imageFile = formData.get(`imageFile-${i}`) as File | null;
      if (imageFile && imageFile.size > 0) {
        newImageStorageIds.push(await uploadImageToConvex(imageFile));
      }
    }

    await fetchMutation(api.products.update, {
      secret: adminSecret(),
      id,
      name,
      handle,
      description,
      price,
      stock,
      status,
      keepUrls,
      newImageStorageIds,
      categoryIds,
      variantOptions,
      addOnProductIds,
    });

    revalidatePath("/admin/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as Id<"products">;

    // The mutation removes the product, its relations, and its stored image files.
    await fetchMutation(api.products.remove, {
      secret: adminSecret(),
      id,
    });

    revalidatePath("/admin/products");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <ProductForm action={createProduct} />
      </div>
      <ProductList
        products={products}
        updateAction={updateProduct}
        deleteAction={deleteProduct}
      />
    </div>
  );
}
