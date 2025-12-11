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

interface VariantOption {
  name: string;
  values: string; // Comma-separated string, will be split on submit
}

interface ProductVariant {
  id: string;
  options: VariantOption[];
}

interface ProductAddOn {
  id: string;
  addOnProduct: {
    id: string;
    name: string;
    price: number;
    images: string;
  };
}

interface Product {
  id: string;
  name: string;
  handle: string;
  price: number;
  images: string;
  stock: number;
  status: string;
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
    status: string;
    images: string; // JSON array of image URLs
    categories: ProductCategory[];
    variants?: ProductVariant[];
    addOns?: ProductAddOn[];
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>(initialData?.status || "active");
  
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

  // Variant options state
  const initialVariants = initialData?.variants && initialData.variants.length > 0
    ? (() => {
        const options = initialData.variants[0].options;
        // Parse if it's a JSON string, otherwise use as-is
        const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
        return Array.isArray(parsedOptions) ? parsedOptions.map((opt: any) => ({
          name: opt.name,
          values: Array.isArray(opt.values) ? opt.values.join(", ") : opt.values
        })) : [];
      })()
    : [];
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>(initialVariants);

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Status *
        </label>
        <select
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
