"use client"
export const runtime = 'edge';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconPlus } from "@tabler/icons-react"
import { BookingOptionsDataTable } from "@/components/booking-options/data-table"
import { AddBookingOptionTypeModal } from "@/components/booking-options/add-booking-option-type-modal"
import { EditBookingOptionTypeModal } from "@/components/booking-options/edit-booking-option-type-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useBookingOptionTypesStore } from "@/store/useBookingOptionTypesStore"
import { BookingOptionType } from "@/interface/BookingOptionType"

export default function BookingOptionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedOptionType, setSelectedOptionType] = useState<BookingOptionType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [optionTypeToDelete, setOptionTypeToDelete] = useState<BookingOptionType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const {
    optionTypes,
    loading,
    error,
    fetchOptionTypes,
    deleteOptionType
  } = useBookingOptionTypesStore()

  useEffect(() => {
    fetchOptionTypes()
  }, [fetchOptionTypes])

  const handleEdit = (optionType: BookingOptionType) => {
    setSelectedOptionType(optionType)
    setIsEditModalOpen(true)
  }

  const handleDelete = (optionType: BookingOptionType) => {
    setOptionTypeToDelete(optionType)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!optionTypeToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteOptionType(optionTypeToDelete.id)
      setIsDeleteDialogOpen(false)
      setOptionTypeToDelete(null)
    } catch (error) {
      console.error("Error deleting option type:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleManageVariants = (optionType: BookingOptionType) => {
    // Navigate to variants page
    window.location.href = `/booking-options/${optionType.id}/variants`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Option Types</h1>
          <p className="text-muted-foreground">
            Manage option types and their variants for bookings
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Option Type
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optionTypes.length}</div>
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
              {optionTypes.filter(ot => ot.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optionTypes.filter(ot => ot.hasVariants).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optionTypes.filter(ot => ot.isRequired).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Option Types List</CardTitle>
          <CardDescription>
            Manage booking option types and their variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingOptionsDataTable
            data={optionTypes}
            onEdit={handleEdit}
            onDelete={(id) => {
              const optionType = optionTypes.find(ot => ot.id === id)
              if (optionType) handleDelete(optionType)
            }}
            onManageVariants={handleManageVariants}
          />
        </CardContent>
      </Card>

      <AddBookingOptionTypeModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      {selectedOptionType && (
        <EditBookingOptionTypeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          optionType={selectedOptionType}
        />
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Option Type"
        description="This action cannot be undone. This will permanently delete the option type and all its variants."
        itemName={optionTypeToDelete?.displayName}
        isLoading={isDeleting}
      />
    </div>
  )
}
