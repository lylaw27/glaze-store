import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { adminSecret } from "@/lib/convex";
import type { Id } from "@/convex/_generated/dataModel";
import type { GalleryImage } from "@/types/product";
import GalleryManager, { type UploadedGalleryImage } from "./GalleryManager";

async function getGallery(): Promise<GalleryImage[]> {
  const images = await fetchQuery(api.gallery.list, { secret: adminSecret() });
  return images as unknown as GalleryImage[];
}

export default async function GalleryPage() {
  const images = await getGallery();

  // Mints short-lived Convex upload URLs so the browser can send image bytes
  // straight to storage (server actions cap request bodies at 1 MB).
  async function getUploadUrls(count: number): Promise<string[]> {
    "use server";
    const n = Math.min(Math.max(Math.floor(count), 0), 50);
    return Promise.all(
      Array.from({ length: n }, () =>
        fetchMutation(api.files.generateUploadUrl, { secret: adminSecret() })
      )
    );
  }

  // Records already-uploaded files (metadata only) as gallery rows.
  async function addToGallery(images: UploadedGalleryImage[]) {
    "use server";
    if (images.length > 0) {
      await fetchMutation(api.gallery.bulkAdd, {
        secret: adminSecret(),
        images: images.map((img) => ({
          ...img,
          storageId: img.storageId as Id<"_storage">,
        })),
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
        getUploadUrlsAction={getUploadUrls}
        addToGalleryAction={addToGallery}
        deleteAction={deleteGalleryImage}
      />
    </div>
  );
}
