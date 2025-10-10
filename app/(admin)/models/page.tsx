"use client"
export const runtime = 'edge';

import { useEffect, useState } from "react"
import { DataTable } from "@/components/models/data-table"
import { AddModelModal } from "@/components/models/add-model-modal"
import { EditModelModal } from "@/components/models/edit-model-modal"
import { Toaster } from "sonner"
import { useModelStore } from "@/store/useModelStore"
import { useBrandStore } from "@/store/useBrandStore"
import { Model } from "@/interface/Model"
import { deleteModel } from "@/lib/api/models"
import { toast } from "sonner"

export default function ModelsPage() {
  const { models, isLoading, error, fetchModels } = useModelStore()
  const { brands, fetchBrands } = useBrandStore()
  const [editingModel, setEditingModel] = useState<Model | null>(null)

  useEffect(() => {
    fetchModels()
    fetchBrands()
  }, [fetchModels, fetchBrands])

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleEdit = (model: Model) => {
    setEditingModel(model)
  }

  const handleEditSuccess = () => {
    setEditingModel(null)
    fetchModels()
  }

  const handleDelete = async (model: Model) => {
    try {
      const response = await deleteModel(model.id)
      if (response.status === 'success') {
        toast.success('Model deleted successfully')
        fetchModels()
      } else {
        toast.error(response.message || 'Error deleting model')
      }
    } catch {
      toast.error('Error deleting model')
    }
  }

  return (
    <>
      <Toaster />
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Models</h1>
          <AddModelModal onSuccess={fetchModels} />
        </div>
        <DataTable data={Array.isArray(models) ? models : []} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      {editingModel && (
        <EditModelModal 
          model={editingModel} 
          brands={Array.isArray(brands) ? brands : []}
          onSuccess={handleEditSuccess}
          open={!!editingModel}
          onOpenChange={(open) => {
            if (!open) {
              setEditingModel(null)
            }
          }}
        />
      )}
    </>
  )
} 
