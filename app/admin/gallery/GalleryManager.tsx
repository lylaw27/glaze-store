"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import type { GalleryImage } from "@/types/product";
import { isDrivePickerConfigured, pickDriveImages } from "@/lib/googleDrivePicker";

export interface UploadedGalleryImage {
  storageId: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

interface GalleryManagerProps {
  images: GalleryImage[];
  getUploadUrlsAction: (count: number) => Promise<string[]>;
  addToGalleryAction: (images: UploadedGalleryImage[]) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

// Resize to max 1600px long edge, convert to WebP, target ~0.7MB.
const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.7,
  fileType: "image/webp",
  useWebWorker: true,
} as const;

const UPLOAD_CONCURRENCY = 3;

// POST one file to a Convex upload URL and return its storage id.
async function uploadToStorage(url: string, file: File): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed for ${file.name} (${res.status})`);
  const { storageId } = (await res.json()) as { storageId: string };
  return storageId;
}

// Read pixel dimensions of an image file in the browser.
function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function GalleryManager({
  images,
  getUploadUrlsAction,
  addToGalleryAction,
  deleteAction,
}: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{
    stage: "Compressing" | "Uploading";
    done: number;
    total: number;
  }>({ stage: "Compressing", done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and upload a batch of files (from the file input or Google Drive).
  // `alreadySkipped` lists names that failed earlier (e.g. Drive downloads).
  const processFiles = async (files: File[], alreadySkipped: string[] = []) => {
    if (files.length === 0) {
      if (alreadySkipped.length > 0) {
        setError(`Couldn't import: ${alreadySkipped.join(", ")}`);
      }
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress({ stage: "Compressing", done: 0, total: files.length });
    const skipped = [...alreadySkipped];

    try {
      // 1. Compress in the browser.
      const prepared: { file: File; name: string; width: number; height: number }[] = [];
      for (const file of files) {
        try {
          const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
          const { width, height } = await readDimensions(compressed);
          const webpName = file.name.replace(/\.[^.]+$/, "") + ".webp";
          prepared.push({
            file: new File([compressed], webpName, { type: "image/webp" }),
            name: file.name,
            width,
            height,
          });
        } catch (err) {
          console.error("Compression failed for", file.name, err);
          skipped.push(file.name);
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      // 2. Upload bytes straight to Convex storage (keeps server-action bodies tiny).
      const uploaded: UploadedGalleryImage[] = [];
      if (prepared.length > 0) {
        setProgress({ stage: "Uploading", done: 0, total: prepared.length });
        const urls = await getUploadUrlsAction(prepared.length);
        for (let i = 0; i < prepared.length; i += UPLOAD_CONCURRENCY) {
          const batch = prepared.slice(i, i + UPLOAD_CONCURRENCY);
          const results = await Promise.allSettled(
            batch.map((p, j) => uploadToStorage(urls[i + j], p.file))
          );
          results.forEach((r, j) => {
            const p = batch[j];
            if (r.status === "fulfilled") {
              uploaded.push({
                storageId: r.value,
                name: p.name,
                size: p.file.size,
                width: p.width || undefined,
                height: p.height || undefined,
              });
            } else {
              console.error(r.reason);
              skipped.push(p.name);
            }
          });
          setProgress((p) => ({ ...p, done: p.done + batch.length }));
        }
      }

      // 3. Record the gallery rows (metadata only).
      if (uploaded.length > 0) {
        await addToGalleryAction(uploaded);
        if (skipped.length > 0) {
          setError(
            `${skipped.length} image${skipped.length === 1 ? "" : "s"} couldn't be processed: ${skipped.join(", ")}`
          );
        }
      } else {
        setError("No images could be processed.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setProgress({ stage: "Compressing", done: 0, total: 0 });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) =>
    processFiles(e.target.files ? Array.from(e.target.files) : []);

  const handleDriveImport = async () => {
    setError(null);
    setDriveStatus("Connecting to Google Drive…");
    try {
      const { files, failed } = await pickDriveImages((n) =>
        setDriveStatus(`Downloading ${n} image${n === 1 ? "" : "s"} from Drive…`)
      );
      setDriveStatus(null);
      await processFiles(files, failed);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Google Drive import failed.");
    } finally {
      setDriveStatus(null);
    }
  };

  const busy = isUploading || driveStatus !== null;

  const handleDelete = async (img: GalleryImage) => {
    if (
      !confirm(
        "Delete this image? It will be removed from any products that use it."
      )
    )
      return;
    setDeletingId(img.id);
    const formData = new FormData();
    formData.append("id", img.id);
    await deleteAction(formData);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div
          onClick={() => !busy && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            busy
              ? "border-gray-200 cursor-not-allowed bg-gray-50"
              : "border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50"
          }`}
        >
          <svg
            className="w-10 h-10 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isUploading ? (
            <p className="text-sm text-gray-600">
              {progress.stage}… {progress.done}/{progress.total}
            </p>
          ) : driveStatus ? (
            <p className="text-sm text-gray-600">{driveStatus}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                Click to upload images
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images are resized to 1600px and converted to WebP automatically.
                Select multiple at once.
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={busy}
          className="hidden"
          aria-label="Upload gallery images"
        />
        {isDrivePickerConfigured && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleDriveImport}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.71 3.5 1.15 15l3.43 6 6.55-11.5L7.71 3.5Zm1.32 0 6.56 11.5h6.86L15.89 3.5H9.03ZM9 16l-3.43 6h13.1l3.43-6H9Z" />
              </svg>
              Choose from Google Drive
            </button>
          </div>
        )}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">
            No images yet. Upload your first images above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(img)}
                  disabled={deletingId === img.id}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  title="Delete image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700 truncate" title={img.name}>
                  {img.name}
                </p>
                <p className="text-xs text-gray-400">
                  {img.width && img.height ? `${img.width}×${img.height} · ` : ""}
                  {formatBytes(img.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
