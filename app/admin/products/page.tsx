import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { uploadProductImage, deleteProductImages } from "@/lib/supabase";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";

async function getProducts() {
  const { data: products, error } = await supabaseAdmin
    .from("Product")
    .select(`
      *,
      categories:ProductCategory(
        category:Category(*)
      )
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }

  return products || [];
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
    const newImageCount = parseInt(formData.get("newImageCount") as string) || 0;
    const categoryIds = JSON.parse(formData.get("categoryIds") as string || "[]");

    const imageUrls: string[] = [];

    // Upload all new images to Supabase
    for (let i = 0; i < newImageCount; i++) {
      const imageFile = formData.get(`imageFile-${i}`) as File | null;
      if (imageFile && imageFile.size > 0) {
        const fileName = `${handle}-${i}-${Date.now()}`;
        const url = await uploadProductImage(imageFile, fileName);
        imageUrls.push(url);
      }
    }

    // Create product
    const { data: product, error: productError } = await supabaseAdmin
      .from("Product")
      .insert({
        name,
        handle,
        description,
        price,
        stock,
        images: JSON.stringify(imageUrls),
      })
      .select()
      .single();

    if (productError) {
      throw productError;
    }

    // Create product-category relationships
    if (categoryIds.length > 0) {
      const productCategories = categoryIds.map((categoryId: string) => ({
        productId: product.id,
        categoryId,
      }));

      const { error: categoryError } = await supabaseAdmin
        .from("ProductCategory")
        .insert(productCategories);

      if (categoryError) {
        throw categoryError;
      }
    }

    revalidatePath("/admin/products");
  }

  async function updateProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const newImageCount = parseInt(formData.get("newImageCount") as string) || 0;
    const existingImages = JSON.parse(formData.get("existingImages") as string || "[]");
    const removedImages = JSON.parse(formData.get("removedImages") as string || "[]");
    const categoryIds = JSON.parse(formData.get("categoryIds") as string || "[]");

    // Delete removed images from storage
    if (removedImages.length > 0) {
      await deleteProductImages(removedImages);
    }

    // Upload new images
    const newImageUrls: string[] = [];
    for (let i = 0; i < newImageCount; i++) {
      const imageFile = formData.get(`imageFile-${i}`) as File | null;
      if (imageFile && imageFile.size > 0) {
        const fileName = `${handle}-${i}-${Date.now()}`;
        const url = await uploadProductImage(imageFile, fileName);
        newImageUrls.push(url);
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];

    // Update product
    const { error: updateError } = await supabaseAdmin
      .from("Product")
      .update({
        name,
        handle,
        description,
        price,
        stock,
        images: JSON.stringify(allImages),
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    // Delete all existing category relationships
    const { error: deleteError } = await supabaseAdmin
      .from("ProductCategory")
      .delete()
      .eq("productId", id);

    if (deleteError) {
      throw deleteError;
    }

    // Create new category relationships
    if (categoryIds.length > 0) {
      const productCategories = categoryIds.map((categoryId: string) => ({
        productId: id,
        categoryId,
      }));

      const { error: categoryError } = await supabaseAdmin
        .from("ProductCategory")
        .insert(productCategories);

      if (categoryError) {
        throw categoryError;
      }
    }

    revalidatePath("/admin/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    // Get the product to delete its images
    const { data: product, error: fetchError } = await supabaseAdmin
      .from("Product")
      .select("images")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete all images from Supabase
    if (product?.images) {
      const imageUrls = JSON.parse(product.images);
      if (imageUrls.length > 0) {
        await deleteProductImages(imageUrls);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("Product")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

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
