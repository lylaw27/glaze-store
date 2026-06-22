"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import type { GalleryImage } from "@/types/product";

interface GalleryManagerProps {
  images: GalleryImage[];
  uploadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

// Resize to max 1600px long edge, convert to WebP, target ~0.7MB.
const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.7,
  fileType: "image/webp",
  useWebWorker: true,
} as const;

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
  uploadAction,
  deleteAction,
}: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setProgress({ done: 0, total: files.length });

    try {
      const formData = new FormData();
      let count = 0;

      for (const file of files) {
        try {
          const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
          const { width, height } = await readDimensions(compressed);
          const webpName = file.name.replace(/\.[^.]+$/, "") + ".webp";

          formData.append(
            `file-${count}`,
            new File([compressed], webpName, { type: "image/webp" })
          );
          formData.append(`name-${count}`, file.name);
          formData.append(`width-${count}`, String(width));
          formData.append(`height-${count}`, String(height));
          count++;
        } catch (err) {
          console.error("Compression failed for", file.name, err);
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      if (count > 0) {
        formData.set("count", String(count));
        await uploadAction(formData);
      } else {
        setError("No images could be processed.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setProgress({ done: 0, total: 0 });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            isUploading
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
              Compressing &amp; uploading… {progress.done}/{progress.total}
            </p>
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
          disabled={isUploading}
          className="hidden"
          aria-label="Upload gallery images"
        />
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
