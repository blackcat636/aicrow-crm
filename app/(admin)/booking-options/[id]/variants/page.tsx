"use client"
export const runtime = 'edge';

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconArrowLeft } from "@tabler/icons-react"
import { BookingOptionVariantsDataTable } from "@/components/booking-options/variants-data-table"
import { AddBookingOptionVariantModal } from "@/components/booking-options/add-booking-option-variant-modal"
import { EditBookingOptionVariantModal } from "@/components/booking-options/edit-booking-option-variant-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useBookingOptionTypesStore } from "@/store/useBookingOptionTypesStore"
import { useBookingOptionVariantsStore } from "@/store/useBookingOptionVariantsStore"
import { BookingOptionVariant } from "@/interface/BookingOptionType"

export default function BookingOptionVariantsPage() {
  const params = useParams()
  const router = useRouter()
  const optionTypeId = parseInt(params.id as string)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<BookingOptionVariant | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<BookingOptionVariant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const {
    optionTypes,
    loading: typesLoading,
    fetchOptionTypes
  } = useBookingOptionTypesStore()

  const {
    variants,
    loading: variantsLoading,
    error: variantsError,
    fetchVariants,
    deleteVariant
  } = useBookingOptionVariantsStore()

  const currentOptionType = optionTypes.find(ot => ot.id === optionTypeId)

  useEffect(() => {
    if (optionTypes.length === 0) {
      fetchOptionTypes()
    }
  }, [optionTypes.length, fetchOptionTypes])

  useEffect(() => {
    if (optionTypeId) {
      fetchVariants(optionTypeId)
    }
  }, [optionTypeId, fetchVariants])

  const handleEdit = (variant: BookingOptionVariant) => {
    setSelectedVariant(variant)
    setIsEditModalOpen(true)
  }

  const handleDelete = (variant: BookingOptionVariant) => {
    setVariantToDelete(variant)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!variantToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteVariant(variantToDelete.id)
      setIsDeleteDialogOpen(false)
      setVariantToDelete(null)
    } catch (error) {
      console.error("Error deleting variant:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    router.push("/booking-options")
  }

  if (typesLoading || variantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (variantsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {variantsError}</div>
      </div>
    )
  }

  if (!currentOptionType) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Option type not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Option Variants: {currentOptionType.displayName}
          </h1>
          <p className="text-muted-foreground">
            Manage variants for option type &quot;{currentOptionType.displayName}&quot;
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{variants.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {variants.filter(v => v.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Default
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {variants.filter(v => v.isDefault).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pricing Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={currentOptionType.pricingType === 'fixed_per_day' ? 'default' : 'secondary'}>
              {currentOptionType.pricingType === 'fixed_per_day' ? 'Fixed per day' : 'Percentage'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variants List</CardTitle>
          <CardDescription>
            Manage variants for option type &quot;{currentOptionType.displayName}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingOptionVariantsDataTable
            data={variants}
            onEdit={handleEdit}
            onDelete={(id) => {
              const variant = variants.find(v => v.id === id)
              if (variant) handleDelete(variant)
            }}
          />
        </CardContent>
      </Card>

      <AddBookingOptionVariantModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        optionTypeId={optionTypeId}
      />

      {selectedVariant && (
        <EditBookingOptionVariantModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          variant={selectedVariant}
        />
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Variant"
        description="This action cannot be undone. This will permanently delete the variant and remove it from all bookings."
        itemName={variantToDelete?.displayName}
        isLoading={isDeleting}
      />
    </div>
  )
}
