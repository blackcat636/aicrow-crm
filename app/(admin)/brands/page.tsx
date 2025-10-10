"use client"
export const runtime = 'edge';
import { useEffect, useState } from "react"
import { DataTable } from "@/components/brands/data-table"
import { useBrandStore } from "@/store/useBrandStore"
import { AddBrandModal } from "@/components/brands/add-brand-modal"
import { EditBrandModal } from "@/components/brands/edit-brand-modal"
import { Toaster } from "sonner"
import { Brand } from "@/interface/Brand"
import { deleteBrand } from "@/lib/api/brands"
import { toast } from "sonner"

export default function Page() {
  const { brands, isLoading, error, fetchBrands } = useBrandStore()
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  if (isLoading || isDeleting) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
  }

  const handleEditSuccess = () => {
    setEditingBrand(null)
    fetchBrands()
  }

  const handleDelete = async (brand: Brand) => {
    setIsDeleting(true)
    try {
      const response = await deleteBrand(brand.id)
      if (response.status === 'success') {
        toast.success('Brand deleted successfully')
        fetchBrands()
      } else {
        toast.error(response.message || 'Error deleting brand')
      }
    } catch {
      toast.error('Error deleting brand')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Brands</h1>
              <AddBrandModal onSuccess={fetchBrands} />
            </div>
            <DataTable data={Array.isArray(brands) ? brands : []} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      </div>
      {editingBrand && (
        <EditBrandModal 
          brand={editingBrand} 
          onSuccess={handleEditSuccess}
          open={!!editingBrand}
          onOpenChange={(open) => {
            if (!open) {
              setEditingBrand(null)
            }
          }}
        />
      )}
    </>
  )
}
