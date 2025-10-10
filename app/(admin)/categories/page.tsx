"use client";
export const runtime = 'edge';

import { useEffect } from "react";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { DataTable } from "@/components/categories/data-table";
import { AddCategoryModal } from "@/components/categories/add-category-modal";

export default function CategoriesPage() {
  const { categories, isLoading, error, fetchCategories } = useCategoriesStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <button 
            onClick={() => fetchCategories()} 
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage vehicle categories
          </p>
        </div>
        <AddCategoryModal onSuccess={() => fetchCategories()} />
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        ) : (
          <DataTable categories={categories} />
        )}
      </div>
    </div>
  );
}
