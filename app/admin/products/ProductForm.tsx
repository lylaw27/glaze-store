"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

interface ProductCategory {
  id: string;
  category: Category;
}

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    id: string;
    name: string;
    handle: string;
    description: string | null;
    price: number;
    stock: number;
    images: string; // JSON array of image URLs
    categories: ProductCategory[];
  };
  onClose?: () => void;
}

export default function ProductForm({
  action,
  initialData,
  onClose,
}: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  // Parse initial images from JSON string
  const initialImages: ImageItem[] = initialData?.images
    ? JSON.parse(initialData.images).map((url: string, index: number) => ({
        id: `existing-${index}`,
        url,
        isNew: false,
      }))
    : [];
  
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Set initial selected categories when editing
  useEffect(() => {
    if (initialData?.categories && categories.length > 0) {
      const categoryIds = initialData.categories.map(pc => pc.category.id);
      setSelectedCategoryIds(categoryIds);
    }
  }, [initialData, categories]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ImageItem = {
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: reader.result as string,
            file,
            isNew: true,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = images.find((img) => img.id === imageId);
    if (imageToRemove && !imageToRemove.isNew) {
      // Track removed existing images for deletion from storage
      setRemovedImageUrls((prev) => [...prev, imageToRemove.url]);
    }
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // Add new image files to form data
      const newImageFiles = images.filter((img) => img.isNew && img.file);
      newImageFiles.forEach((img, index) => {
        if (img.file) {
          formData.append(`imageFile-${index}`, img.file);
        }
      });
      formData.set("newImageCount", newImageFiles.length.toString());
      
      // Add existing images that weren't removed (as JSON)
      const existingImageUrls = images
        .filter((img) => !img.isNew)
        .map((img) => img.url);
      formData.set("existingImages", JSON.stringify(existingImageUrls));
      
      // Add removed image URLs for deletion
      formData.set("removedImages", JSON.stringify(removedImageUrls));
      
      // Add selected category IDs
      formData.set("categoryIds", JSON.stringify(selectedCategoryIds));
      
      await action(formData);
      setIsOpen(false);
      onClose?.();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Product
      </button>
    );
  }

  if (!isEditing && !isOpen) return null;

  const formContent = (
    <form action={handleSubmit} className="space-y-4">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label
          htmlFor="handle"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Handle (URL Path) *
        </label>
        <input
          type="text"
          id="handle"
          name="handle"
          required
          defaultValue={initialData?.handle}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="my-product-name"
        />
        <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (e.g., blue-ceramic-vase)</p>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description || ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            step="0.01"
            min="0"
            defaultValue={initialData?.price}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            required
            min="0"
            defaultValue={initialData?.stock ?? 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Product Images
        </label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative">
                <Image
                  src={image.url}
                  alt="Product preview"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs text-gray-500 mt-1">Add</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="imageFiles"
            name="imageFiles"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            aria-label="Upload product images"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Select images
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, WebP. You can select multiple images.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        {categories.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            No categories available. <a href="/admin/categories" className="text-blue-600 hover:text-blue-800">Create categories first</a>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(
              categories.reduce((acc, cat) => {
                if (!acc[cat.type]) acc[cat.type] = [];
                acc[cat.type].push(cat);
                return acc;
              }, {} as Record<string, Category[]>)
            ).map(([type, cats]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">{type}</div>
                <div className="flex flex-wrap gap-2">
                  {cats.map((category) => (
                    <label
                      key={category.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedCategoryIds.includes(category.id)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="sr-only"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Select one or more categories for this product</p>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );

  if (isEditing) {
    return formContent;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Product
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Product
            </h2>
            {formContent}
          </div>
        </div>
      )}
    </>
  );
}
