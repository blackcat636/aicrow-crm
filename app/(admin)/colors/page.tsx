"use client"
export const runtime = 'edge';

import { useEffect, useState } from "react"
import { Toaster } from "sonner"
import { useColorsStore } from "../../../store/useColorsStore"
import { DataTable } from "../../../components/colors/data-table"
import { AddColorModal } from "../../../components/colors/add-color-modal"
import { EditColorModal } from "../../../components/colors/edit-color-modal"
import { Color } from "@/interface/Color"
import { deleteColor } from "@/lib/api/colors"
import { toast } from "sonner"

export default function ColorsPage() {
    const { colors, isLoading, error, fetchColors } = useColorsStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingColor, setEditingColor] = useState<Color | null>(null)

    useEffect(() => {
        fetchColors()
    }, [fetchColors])
  
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleEdit = (color: Color) => {
        setEditingColor(color)
    }

    const handleEditSuccess = () => {
        setEditingColor(null)
        fetchColors()
    }

    const handleDelete = async (color: Color) => {
        try {
            const response = await deleteColor(color.id)
            if (response.status === 'success' || response.status === 200) {
                toast.success('Color deleted successfully')
                fetchColors()
            } else {
                toast.error(response.message || 'Error deleting color')
            }
        } catch {
            toast.error('Error deleting color')
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Colors</h1>
                <AddColorModal 
                    onSuccess={fetchColors} 
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
            </div>
            <DataTable data={colors} onEdit={handleEdit} onDelete={handleDelete} />
            {editingColor && (
                <EditColorModal 
                    color={editingColor} 
                    onSuccess={handleEditSuccess}
                    open={!!editingColor}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingColor(null)
                        }
                    }}
                />
            )}
            <Toaster />
        </div>
    )
} 
