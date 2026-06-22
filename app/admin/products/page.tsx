import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { adminSecret } from "@/lib/convex";
import type { Id } from "@/convex/_generated/dataModel";
import type { GalleryImage } from "@/types/product";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import { AdminProduct } from "@/types";

async function getProducts(): Promise<AdminProduct[]> {
  const products = await fetchQuery(api.products.listForAdmin, {
    secret: adminSecret(),
  });
  return products as unknown as AdminProduct[];
}

async function getGallery(): Promise<GalleryImage[]> {
  const images = await fetchQuery(api.gallery.list, { secret: adminSecret() });
  return images as unknown as GalleryImage[];
}

export default async function ProductsPage() {
  const [products, galleryImages] = await Promise.all([
    getProducts(),
    getGallery(),
  ]);

  async function createProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const status = (formData.get("status") as string) || "active";
    const categoryIds = JSON.parse(
      (formData.get("categoryIds") as string) || "[]"
    ) as Id<"categories">[];
    const variantOptions = JSON.parse(
      (formData.get("variantOptions") as string) || "[]"
    ) as { name: string; values: string[] }[];
    const addOnProductIds = JSON.parse(
      (formData.get("addOnProductIds") as string) || "[]"
    ) as Id<"products">[];

    // Images are gallery files chosen in the form; the form sends ordered storage ids.
    const imageStorageIds = JSON.parse(
      (formData.get("imageStorageIds") as string) || "[]"
    ) as Id<"_storage">[];

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
    revalidatePath("/");
    revalidatePath("/products");
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
    const categoryIds = JSON.parse(
      (formData.get("categoryIds") as string) || "[]"
    ) as Id<"categories">[];
    const variantOptions = JSON.parse(
      (formData.get("variantOptions") as string) || "[]"
    ) as { name: string; values: string[] }[];
    const addOnProductIds = JSON.parse(
      (formData.get("addOnProductIds") as string) || "[]"
    ) as Id<"products">[];

    // Full ordered set of gallery image storage ids the product should keep.
    const imageStorageIds = JSON.parse(
      (formData.get("imageStorageIds") as string) || "[]"
    ) as Id<"_storage">[];

    await fetchMutation(api.products.update, {
      secret: adminSecret(),
      id,
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
    revalidatePath("/");
    revalidatePath("/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as Id<"products">;

    // The mutation removes the product and its relations (gallery owns the files).
    await fetchMutation(api.products.remove, {
      secret: adminSecret(),
      id,
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/products");
  }

  async function reorderProducts(formData: FormData) {
    "use server";
    const orderedIds = JSON.parse(
      (formData.get("orderedIds") as string) || "[]"
    ) as Id<"products">[];

    await fetchMutation(api.products.reorder, {
      secret: adminSecret(),
      orderedIds,
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/products");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <ProductForm action={createProduct} galleryImages={galleryImages} />
      </div>
      <ProductList
        products={products}
        galleryImages={galleryImages}
        updateAction={updateProduct}
        deleteAction={deleteProduct}
        reorderAction={reorderProducts}
      />
    </div>
  );
}
