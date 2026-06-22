import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { adminSecret, uploadImageToConvex } from "@/lib/convex";
import type { Id } from "@/convex/_generated/dataModel";
import type { GalleryImage } from "@/types/product";
import GalleryManager from "./GalleryManager";

async function getGallery(): Promise<GalleryImage[]> {
  const images = await fetchQuery(api.gallery.list, { secret: adminSecret() });
  return images as unknown as GalleryImage[];
}

export default async function GalleryPage() {
  const images = await getGallery();

  // Receives client-compressed files plus their metadata, uploads the bytes to
  // Convex storage, and records them as gallery rows.
  async function uploadToGallery(formData: FormData) {
    "use server";
    const count = parseInt((formData.get("count") as string) || "0", 10);

    const uploaded: {
      storageId: Id<"_storage">;
      name: string;
      size: number;
      width?: number;
      height?: number;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const file = formData.get(`file-${i}`) as File | null;
      if (!file || file.size === 0) continue;
      const storageId = await uploadImageToConvex(file);
      const width = formData.get(`width-${i}`);
      const height = formData.get(`height-${i}`);
      uploaded.push({
        storageId,
        name: (formData.get(`name-${i}`) as string) || file.name,
        size: file.size,
        width: width ? parseInt(width as string, 10) : undefined,
        height: height ? parseInt(height as string, 10) : undefined,
      });
    }

    if (uploaded.length > 0) {
      await fetchMutation(api.gallery.bulkAdd, {
        secret: adminSecret(),
        images: uploaded,
      });
    }

    revalidatePath("/admin/gallery");
  }

  async function deleteGalleryImage(formData: FormData) {
    "use server";
    const id = formData.get("id") as Id<"galleryImages">;
    await fetchMutation(api.gallery.remove, { secret: adminSecret(), id });
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/products");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
      </div>
      <GalleryManager
        images={images}
        uploadAction={uploadToGallery}
        deleteAction={deleteGalleryImage}
      />
    </div>
  );
}
