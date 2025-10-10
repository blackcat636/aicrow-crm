"use client"
export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSpecificationById, deleteSpecification } from "@/lib/api/specifications"
import { Specification } from "@/interface/Specification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { EditSpecificationModal } from "@/components/specifications/edit-specification-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { toast } from "sonner"

export default function SpecificationPage() {
    const params = useParams()
    const router = useRouter()
    const [specification, setSpecification] = useState<Specification | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const fetchSpecification = useCallback(async () => {
        try {
            const response = await getSpecificationById(Number(params.id))
            if (response.status === 'success' && response.data) {
                setSpecification(response.data)
            } else {
                setError(response.error || 'Error loading specification')
            }
        } catch {
            setError('Error loading specification')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    const handleDelete = async () => {
        if (!specification) return
        
        setIsDeleting(true)
        try {
            const response = await deleteSpecification(specification.id)
            if (response.status === 'success') {
                toast.success('Specification deleted successfully')
                router.push('/specifications')
            } else {
                toast.error(response.message || 'Error deleting specification')
            }
        } catch {
            toast.error('Error deleting specification')
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchSpecification()
        }
    }, [params.id, fetchSpecification])

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-500">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!specification) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Specification not found</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/specifications">Specifications</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/specifications/${specification.id}`}>{specification.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{specification.name}</CardTitle>
                            <CardDescription>
                                <Badge variant="outline">{specification.type}</Badge>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <EditSpecificationModal 
                                    specification={specification} 
                                    onSuccess={fetchSpecification} 
                                />
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    Delete
                                </Button>
                                <DeleteConfirmationDialog
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                    onConfirm={handleDelete}
                                    title="Delete Specification"
                                    description="Are you sure you want to delete this specification? This action cannot be undone."
                                    itemName={specification.name}
                                    isLoading={isDeleting}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
} 