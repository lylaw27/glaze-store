import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { uploadProductImage, deleteProductImages } from "@/lib/supabase";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import { randomUUID } from "crypto";
import { AdminProductQueryResult, AdminProduct, ProductStatus } from "@/types";

async function getProducts(): Promise<AdminProduct[]> {
  const { data: products, error } = await supabaseAdmin
    .from("Product")
    .select(`
      *,
      categories:ProductCategory(
        id,
        productId,
        categoryId,
        category:Category(*)
      ),
      variants:ProductVariant(*),
      addOns:ProductAddOn!ProductAddOn_mainProductId_fkey(
        id,
        mainProductId,
        addOnProductId,
        createdAt,
        addOnProduct:Product!ProductAddOn_addOnProductId_fkey(*)
      )
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }

  // Type cast and parse the results
  const typedProducts = (products || []) as AdminProductQueryResult[];
  
  return typedProducts.map((product): AdminProduct => ({
    ...product,
    status: product.status as ProductStatus,
    variants: product.variants?.map(v => ({
      ...v,
      options: JSON.parse(v.options)
    })),
    addOns: product.addOns
  }));
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
    const status = (formData.get("status") as string || "active") as ProductStatus;
    const newImageCount = parseInt(formData.get("newImageCount") as string) || 0;
    const categoryIds: string[] = JSON.parse(formData.get("categoryIds") as string || "[]");
    const variantOptions = formData.get("variantOptions") as string;
    const addOnProductIds: string[] = JSON.parse(formData.get("addOnProductIds") as string || "[]");

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
      // @ts-expect-error - Supabase type generation issue
      .insert({
        name,
        handle,
        description,
        price,
        stock,
        status,
        images: JSON.stringify(imageUrls),
      })
      .select()
      .single();

    if (productError || !product) {
      throw productError || new Error("Failed to create product");
    }

    type CreatedProduct = { id: string };
    const typedProduct = product as CreatedProduct;

    // Create product-category relationships
    if (categoryIds.length > 0) {
      const productCategories = categoryIds.map((categoryId) => ({
        id: randomUUID(),
        productId: typedProduct.id,
        categoryId,
      }));

      const { error: categoryError } = await supabaseAdmin
        .from("ProductCategory")
        // @ts-expect-error - Supabase type generation issue
        .insert(productCategories);

      if (categoryError) {
        throw categoryError;
      }
    }

    // Create product variants if provided
    if (variantOptions && variantOptions !== "[]") {
      const { error: variantError} = await supabaseAdmin
        .from("ProductVariant")
        // @ts-expect-error - Supabase type generation issue
        .insert({
          id: randomUUID(),
          productId: typedProduct.id,
          options: variantOptions,
        });

      if (variantError) {
        throw variantError;
      }
    }

    // Create product add-on relationships
    if (addOnProductIds.length > 0) {
      const productAddOns = addOnProductIds.map((addOnProductId) => ({
        id: randomUUID(),
        mainProductId: typedProduct.id,
        addOnProductId,
      }));

      const { error: addOnError } = await supabaseAdmin
        .from("ProductAddOn")
        // @ts-expect-error - Supabase type generation issue
        .insert(productAddOns);

      if (addOnError) {
        throw addOnError;
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
    const status = (formData.get("status") as string || "active") as ProductStatus;
    const newImageCount = parseInt(formData.get("newImageCount") as string) || 0;
    const existingImages: string[] = JSON.parse(formData.get("existingImages") as string || "[]");
    const removedImages: string[] = JSON.parse(formData.get("removedImages") as string || "[]");
    const categoryIds: string[] = JSON.parse(formData.get("categoryIds") as string || "[]");
    const variantOptions = formData.get("variantOptions") as string;
    const addOnProductIds: string[] = JSON.parse(formData.get("addOnProductIds") as string || "[]");

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
      // @ts-expect-error - Supabase type generation issue
      .update({
        name,
        handle,
        description,
        price,
        stock,
        status,
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
      const productCategories = categoryIds.map((categoryId) => ({
        id: randomUUID(),
        productId: id,
        categoryId,
      }));

      const { error: categoryError } = await supabaseAdmin
        .from("ProductCategory")
        // @ts-expect-error - Supabase type generation issue
        .insert(productCategories);

      if (categoryError) {
        throw categoryError;
      }
    }

    // Update or create product variants
    const { data: existingVariant } = await supabaseAdmin
      .from("ProductVariant")
      .select("id")
      .eq("productId", id)
      .single();

    if (variantOptions && variantOptions !== "[]") {
      if (existingVariant) {
        // Update existing variant
        const { error: variantError } = await supabaseAdmin
          .from("ProductVariant")
        // @ts-expect-error - Supabase type generation issue
          .update({ options: variantOptions })
          .eq("productId", id);

        if (variantError) {
          throw variantError;
        }
      } else {
        // Create new variant
        const { error: variantError } = await supabaseAdmin
          .from("ProductVariant")
        // @ts-expect-error - Supabase type generation issue
          .insert({
            id: randomUUID(),
            productId: id,
            options: variantOptions,
          });

        if (variantError) {
          throw variantError;
        }
      }
    } else if (existingVariant) {
      // Delete variant if options are empty
      const { error: deleteVariantError } = await supabaseAdmin
        .from("ProductVariant")
        .delete()
        .eq("productId", id);

      if (deleteVariantError) {
        throw deleteVariantError;
      }
    }

    // Update product add-ons
    // Delete all existing add-on relationships
    const { error: deleteAddOnsError } = await supabaseAdmin
      .from("ProductAddOn")
      .delete()
      .eq("mainProductId", id);

    if (deleteAddOnsError) {
      throw deleteAddOnsError;
    }

    // Create new add-on relationships
    if (addOnProductIds.length > 0) {
      const productAddOns = addOnProductIds.map((addOnProductId) => ({
        id: randomUUID(),
        mainProductId: id,
        addOnProductId,
      }));

      const { error: addOnError } = await supabaseAdmin
        .from("ProductAddOn")
        // @ts-expect-error - Supabase type generation issue
        .insert(productAddOns);

      if (addOnError) {
        throw addOnError;
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

    type ProductWithImages = { images: string };
    const typedProduct = product as ProductWithImages | null;

    // Delete all images from Supabase
    if (typedProduct?.images) {
      const imageUrls: string[] = JSON.parse(typedProduct.images);
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
