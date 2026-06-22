"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  Product,
  Category,
  VariantOptionForm,
  ProductImageRef,
  GalleryImage,
} from "@/types/product";

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  galleryImages: GalleryImage[];
  initialData?: Product
  onClose?: () => void;
}

// One draggable, removable thumbnail in the selected-images row.
function SortableThumb({
  image,
  onRemove,
}: {
  image: ProductImageRef;
  onRemove: (storageId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.storageId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <Image
          src={image.url}
          alt="Product image"
          width={96}
          height={96}
          className="w-24 h-24 object-cover rounded-lg border border-gray-300"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(image.storageId)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
        title="Remove image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ProductForm({
  action,
  galleryImages,
  initialData,
  onClose,
}: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>(initialData?.status || "active");
  
  // Parse initial images (admin shape is a JSON string of { storageId, url }).
  const initialImages: ProductImageRef[] = initialData?.images
    ? (JSON.parse(initialData.images) as ProductImageRef[])
    : [];

  // Ordered list of gallery images selected for this product.
  const [selectedImages, setSelectedImages] =
    useState<ProductImageRef[]>(initialImages);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  // Variant options state
  const initialVariants = initialData?.variants && initialData.variants.length > 0
    ? (() => {
        const options = initialData.variants[0].options;
        // Parse if it's a JSON string, otherwise use as-is
        const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
        return Array.isArray(parsedOptions) ? parsedOptions.map((opt: { name: string; values: string[] | string }) => ({
          name: opt.name,
          values: Array.isArray(opt.values) ? opt.values.join(", ") : opt.values
        })) : [];
      })()
    : [];
  const [variantOptions, setVariantOptions] = useState<VariantOptionForm[]>(initialVariants);

  const isEditing = !!initialData;

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?limit=1000"),
        ]);
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Set initial selected categories and add-ons when editing
  useEffect(() => {
    if (initialData?.categories && categories.length > 0) {
      const categoryIds = initialData.categories.map(pc => pc.category.id);
      setSelectedCategoryIds(categoryIds);
    }
    
    if (initialData?.addOns && products.length > 0) {
      const addOnIds = initialData.addOns.map(ao => ao.addOnProduct.id);
      setSelectedAddOnIds(addOnIds);
    }
  }, [initialData, categories, products]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddOnToggle = (productId: string) => {
    setSelectedAddOnIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addVariantOption = () => {
    setVariantOptions([...variantOptions, { name: "", values: "" }]);
  };

  const removeVariantOption = (index: number) => {
    setVariantOptions(variantOptions.filter((_, i) => i !== index));
  };

  const updateVariantOptionName = (index: number, name: string) => {
    const updated = [...variantOptions];
    updated[index].name = name;
    setVariantOptions(updated);
  };

  const updateVariantOptionValues = (index: number, valuesString: string) => {
    const updated = [...variantOptions];
    updated[index].values = valuesString;
    setVariantOptions(updated);
  };

  // Toggle a gallery image in/out of the product's selection (appends to the end).
  const toggleGalleryImage = (img: GalleryImage) => {
    setSelectedImages((prev) =>
      prev.some((s) => s.storageId === img.storageId)
        ? prev.filter((s) => s.storageId !== img.storageId)
        : [...prev, { storageId: img.storageId, url: img.url }]
    );
  };

  const handleRemoveImage = (storageId: string) => {
    setSelectedImages((prev) => prev.filter((s) => s.storageId !== storageId));
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSelectedImages((prev) => {
      const oldIndex = prev.findIndex((s) => s.storageId === active.id);
      const newIndex = prev.findIndex((s) => s.storageId === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // Send the full ordered set of selected gallery image storage ids.
      formData.set(
        "imageStorageIds",
        JSON.stringify(selectedImages.map((img) => img.storageId))
      );

      // Add selected category IDs
      formData.set("categoryIds", JSON.stringify(selectedCategoryIds));
      
      // Add status
      formData.set("status", status);
      
      // Add variant options (filter out empty options and split values)
      const validVariants = variantOptions
        .filter(opt => opt.name && opt.values.trim())
        .map(opt => ({
          name: opt.name,
          values: opt.values.split(",").map(v => v.trim()).filter(v => v)
        }));
      formData.set("variantOptions", JSON.stringify(validVariants));
      
      // Add selected add-on product IDs
      formData.set("addOnProductIds", JSON.stringify(selectedAddOnIds));
      
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Images
        </label>
        <div className="space-y-3">
          {selectedImages.length > 0 && (
            <DndContext
              id="product-images-dnd"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleImageDragEnd}
            >
              <SortableContext
                items={selectedImages.map((img) => img.storageId)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-3">
                  {selectedImages.map((image) => (
                    <SortableThumb
                      key={image.storageId}
                      image={image}
                      onRemove={handleRemoveImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <button
            type="button"
            onClick={() => setShowGalleryPicker(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Choose from gallery
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Pick images from the{" "}
          <a href="/admin/gallery" className="text-blue-600 hover:text-blue-800">
            gallery
          </a>
          . Drag to reorder &mdash; the first image is the main one shown on the
          storefront.
        </p>
      </div>

      {showGalleryPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Select images ({selectedImages.length} selected)
              </h3>
              <button
                type="button"
                onClick={() => setShowGalleryPicker(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {galleryImages.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">
                  No images in the gallery yet.{" "}
                  <a href="/admin/gallery" className="text-blue-600 hover:text-blue-800">
                    Upload some first
                  </a>
                  .
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {galleryImages.map((img) => {
                    const selected = selectedImages.some(
                      (s) => s.storageId === img.storageId
                    );
                    return (
                      <button
                        type="button"
                        key={img.id}
                        onClick={() => toggleGalleryImage(img)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          selected ? "border-blue-500" : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 20vw"
                        />
                        {selected && (
                          <span className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowGalleryPicker(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Status *
        </label>
        <select
          title="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Active (Visible on storefront)</option>
          <option value="hidden">Hidden (Admin only)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Hidden products will not appear on the storefront</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Variants
        </label>
        <div className="space-y-3">
          {variantOptions.map((option, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Option name (e.g., Size, Color)"
                    value={option.name}
                    onChange={(e) => updateVariantOptionName(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Values separated by commas (e.g., Small, Medium, Large)"
                    value={option.values}
                    onChange={(e) => updateVariantOptionValues(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariantOption(index)}
                  className="text-red-500 hover:text-red-700 mt-2"
                  title="Remove option"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariantOption}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Variant Option
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Add multiple options like Size, Color, Material with their respective values</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Add-ons
        </label>
        {products.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">Loading products...</div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {products
                .filter(p => p.id !== initialData?.id) // Don't show self
                .map((product) => {
                  const productImages = product.images;
                  const firstImage = productImages[0];
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedAddOnIds.includes(product.id)
                          ? "bg-blue-50 border-blue-500"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddOnIds.includes(product.id)}
                        onChange={() => handleAddOnToggle(product.id)}
                        className="rounded border-gray-300"
                      />
                      {firstImage && (
                        <Image
                          src={firstImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">${product.price.toFixed(2)}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        product.status === "active" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {product.status}
                      </div>
                    </label>
                  );
                })}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Select products that customers can add as extras (e.g., shoelaces for shoes)</p>
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
