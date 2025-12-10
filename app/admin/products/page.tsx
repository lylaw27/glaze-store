import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadProductImage, deleteProductImages } from "@/lib/supabase";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
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

    await prisma.product.create({
      data: {
        name,
        handle,
        description,
        price,
        stock,
        images: JSON.stringify(imageUrls),
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
    });

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

    // Update product and replace categories
    await prisma.product.update({
      where: { id },
      data: {
        name,
        handle,
        description,
        price,
        stock,
        images: JSON.stringify(allImages),
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
    });

    revalidatePath("/admin/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    // Get the product to delete its images
    const product = await prisma.product.findUnique({
      where: { id },
      select: { images: true },
    });

    // Delete all images from Supabase
    if (product?.images) {
      const imageUrls = JSON.parse(product.images);
      if (imageUrls.length > 0) {
        await deleteProductImages(imageUrls);
      }
    }

    await prisma.product.delete({
      where: { id },
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
