"use client"
export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { getBrandById, deleteBrand } from "@/lib/api/brands"
import { Brand } from "@/interface/Brand"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { EditBrandModal } from "@/components/brands/edit-brand-modal"
import { LoadLogoBrandModal } from "@/components/brands/load-logo-brand-modal"
import { LoadImageBrandModal } from "@/components/brands/load-image-brand-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { toast } from "sonner"

export default function BrandPage() {
    const params = useParams()
    const router = useRouter()
    const [brand, setBrand] = useState<Brand | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const fetchBrand = useCallback(async () => {
        try {
            const response = await getBrandById(Number(params.id))
            console.log('🏷️ BrandPage: API response:', response);
            if (response.status === 'success' && response.data) {
                console.log('🏷️ BrandPage: Setting brand data:', response.data);
                setBrand(response.data)
            } else {
                setError(response.error || 'Error loading brand')
            }
        } catch {
            setError('Error loading brand')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    const handleDelete = async () => {
        if (!brand) return
        
        setIsDeleting(true)
        try {
            const response = await deleteBrand(brand.id)
            if (response.status === 'success') {
                toast.success('Brand deleted successfully')
                router.push('/brands')
            } else {
                toast.error(response.message || 'Error deleting brand')
            }
        } catch {
            toast.error('Error deleting brand')
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchBrand()
        }
    }, [params.id, fetchBrand])

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

    if (!brand) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Brand not found</CardTitle>
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
                        <BreadcrumbLink href="/brands">Brands</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/brands/${brand.id}`}>{brand.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{brand.name}</CardTitle>
                            <CardDescription>{brand.slug}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                {brand.isPremium && <Badge variant="secondary">Premium</Badge>}
                                {brand.isNew==true && <Badge variant="secondary">New</Badge>}
                                {brand.isFeatured==true && <Badge variant="outline">Featured</Badge>}
                            </div>
                            <div className="flex gap-2">
                                <EditBrandModal brand={brand} onSuccess={fetchBrand} />
                                <LoadLogoBrandModal brand={brand} onSuccess={fetchBrand} />
                                <LoadImageBrandModal brand={brand} onSuccess={fetchBrand} />
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
                                    title="Delete Brand"
                                    description="Are you sure you want to delete this brand? This action cannot be undone."
                                    itemName={brand.name}
                                    isLoading={isDeleting}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {brand.logoUrl && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Logo</h3>
                                    <div className="relative w-full aspect-video max-w-24 h-24">
                                        <Image
                                            src={brand.logoUrl}
                                            alt={`${brand.name} logo`}
                                            fill
                                            className="object-contain max-w-24 h-24"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {brand.imageUrl && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Image</h3>
                                    <div className="relative w-full aspect-video">
                                        <Image
                                            src={brand.imageUrl}
                                            alt={`${brand.name} image`}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    <div className="grid gap-6">
                        {brand.description && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground">{brand.description}</p>
                            </div>
                        )}
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Models:</span>
                                    <span className="font-medium">{brand.modelCount}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Vehicles:</span>
                                    <span className="font-medium">{brand.vehicleCount}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Details</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="text-sm">{new Date(brand.createdAt).toLocaleDateString('en-US')}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Updated:</span>
                                    <span className="text-sm">{new Date(brand.updatedAt).toLocaleDateString('en-US')}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Sort Order:</span>
                                    <span className="text-sm">{brand.sortOrder}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 