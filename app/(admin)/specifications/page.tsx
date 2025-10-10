"use client"
export const runtime = 'edge';

import { useEffect, useState } from "react"
import { AddSpecificationModal } from "@/components/specifications/add-specification-modal"
import { EditSpecificationModal } from "@/components/specifications/edit-specification-modal"
import { Toaster } from "sonner"
import { useSpecificationsStore } from "@/store/useSpecificationsStore"
import { DataTable } from "@/components/specifications/data-table"
import { Specification } from "@/interface/Specification"
import { deleteSpecification } from "@/lib/api/specifications"
import { toast } from "sonner"

export default function SpecificationsPage() {
    const { specifications, isLoading, error, fetchSpecifications } = useSpecificationsStore()
    const [editingSpecification, setEditingSpecification] = useState<Specification | null>(null)

    useEffect(() => {
        fetchSpecifications()
    }, [fetchSpecifications])
  
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleEdit = (specification: Specification) => {
        setEditingSpecification(specification)
    }

    const handleEditSuccess = () => {
        setEditingSpecification(null)
        fetchSpecifications()
    }

    const handleDelete = async (specification: Specification) => {
        try {
            const response = await deleteSpecification(specification.id)
            if (response.status === 'success') {
                toast.success('Specification deleted successfully')
                window.location.reload()
            } else {
                toast.error(response.message || 'Error deleting specification')
            }
        } catch {
            toast.error('Error deleting specification')
        }
    }

    return (
        <>
            <Toaster />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Specifications</h1>
                    <AddSpecificationModal onSuccess={fetchSpecifications} />
                </div>
                <DataTable data={specifications} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            {editingSpecification && (
                <EditSpecificationModal 
                    specification={editingSpecification} 
                    onSuccess={handleEditSuccess}
                    open={!!editingSpecification}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            setEditingSpecification(null)
                        }
                    }}
                />
            )}
        </>
    )
} 
