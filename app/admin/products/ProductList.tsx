"use client";

import { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product, ProductImageRef, GalleryImage } from "@/types/product";

interface ProductListProps {
  products: Product[];
  galleryImages: GalleryImage[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  reorderAction: (formData: FormData) => Promise<void>;
}

function parseImages(raw: string): ProductImageRef[] {
  try {
    return JSON.parse(raw || "[]") as ProductImageRef[];
  } catch {
    return [];
  }
}

export default function ProductList({
  products,
  galleryImages,
  updateAction,
  deleteAction,
  reorderAction,
}: ProductListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Local copy so drag reordering is reflected optimistically before the server
  // round-trip. Re-syncs whenever the server sends a fresh products list.
  const [items, setItems] = useState<Product[]>(products);
  useEffect(() => setItems(products), [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    const formData = new FormData();
    formData.append("id", id);
    await deleteAction(formData);
    setDeletingId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered); // optimistic

    const formData = new FormData();
    formData.append("orderedIds", JSON.stringify(reordered.map((p) => p.id)));
    await reorderAction(formData);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-500">No products yet. Add your first product!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* DndContext wraps the whole table: its injected a11y nodes are siblings of
          <table>, which keeps the markup valid (a <div> can't be a table child). */}
      <DndContext
        id="product-list-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-2 py-3" aria-label="Drag to reorder" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <SortableContext
            items={items.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="divide-y divide-gray-200">
              {items.map((product) => (
                <SortableRow
                  key={product.id}
                  product={product}
                  isEditing={editingId === product.id}
                  isDeleting={deletingId === product.id}
                  galleryImages={galleryImages}
                  updateAction={updateAction}
                  onEdit={() => setEditingId(product.id)}
                  onCloseEdit={() => setEditingId(null)}
                  onDelete={() => handleDelete(product.id)}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
}

interface SortableRowProps {
  product: Product;
  isEditing: boolean;
  isDeleting: boolean;
  galleryImages: GalleryImage[];
  updateAction: (formData: FormData) => Promise<void>;
  onEdit: () => void;
  onCloseEdit: () => void;
  onDelete: () => void;
}

function SortableRow({
  product,
  isEditing,
  isDeleting,
  galleryImages,
  updateAction,
  onEdit,
  onCloseEdit,
  onDelete,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id, disabled: isEditing });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <tr ref={setNodeRef} style={style}>
        <td colSpan={7} className="px-6 py-4">
          <ProductForm
            action={updateAction}
            initialData={product}
            galleryImages={galleryImages}
            onClose={onCloseEdit}
          />
        </td>
      </tr>
    );
  }

  const images = parseImages(product.images);

  return (
    <tr ref={setNodeRef} style={style} className="bg-white">
      <td className="w-10 px-2 py-4 text-center">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 5a1 1 0 11-2 0 1 1 0 012 0zM7 10a1 1 0 11-2 0 1 1 0 012 0zM7 15a1 1 0 11-2 0 1 1 0 012 0zM13 5a1 1 0 11-2 0 1 1 0 012 0zM13 10a1 1 0 11-2 0 1 1 0 012 0zM13 15a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {images.length > 0 ? (
            <div className="relative">
              <Image
                src={images[0].url}
                alt={product.name}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg"
              />
              {images.length > 1 && (
                <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded-full">
                  +{images.length - 1}
                </span>
              )}
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            {product.description && (
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {product.description}
              </p>
            )}
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {product.categories.map((pc) => (
                  <span
                    key={pc.id}
                    className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800"
                  >
                    {pc.category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            product.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {product.status === "active" ? "Active" : "Hidden"}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-900">${product.price.toFixed(2)}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            product.stock > 10
              ? "bg-green-100 text-green-800"
              : product.stock > 0
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.stock} in stock
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {product.variants && product.variants.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              {product.variants[0].options.length} variant
              {product.variants[0].options.length !== 1 ? "s" : ""}
            </span>
          )}
          {product.addOns && product.addOns.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {product.addOns.length} add-on{product.addOns.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-2"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
