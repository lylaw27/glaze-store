"use client";

import { useState } from "react";

interface Category {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

interface CategoryFormProps {
  onSubmit: (data: { name: string; type: string }) => Promise<void>;
  initialData?: Category;
  onCancel: () => void;
}

function CategoryForm({ onSubmit, initialData, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onSubmit({ name, type });
      if (!initialData) {
        setName("");
        setType("");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Electronics, Christmas"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Category Type *
        </label>
        <input
          type="text"
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          placeholder="e.g., Department, Festival, Style"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Group categories by type (e.g., Department for Arts/Electronics, Festival for Christmas/Easter)
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  // Group categories by type
  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = [];
    }
    acc[category.type].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="space-y-6">
      {Object.keys(groupedCategories).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No categories yet. Create your first category above.</p>
        </div>
      ) : (
        Object.entries(groupedCategories).map(([type, cats]) => (
          <div key={type} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{type}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {cats.map((category) => (
                <div
                  key={category.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category._count && category._count.products > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        Used in {category._count.products} product{category._count.products !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(category)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === category.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export { CategoryForm };
