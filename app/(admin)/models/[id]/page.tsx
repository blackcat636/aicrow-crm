"use client"
export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { getModelById } from "@/lib/api/models"
import { Model } from "@/interface/Model"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { EditModelModal } from "@/components/models/edit-model-modal"
import { getAllBrands } from "@/lib/api/brands"
import { Brand } from "@/interface/Brand"

export default function ModelPage() {
    const params = useParams()
    const [model, setModel] = useState<Model | null>(null)
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchModel = useCallback(async () => {
        try {
            const response = await getModelById(Number(params.id))
            if (response.status === 'success' && response.data) {
                setModel(response.data)
            } else {
                setError(response.error || 'Error loading model')
            }
        } catch {
            setError('Error loading model')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    const fetchBrands = useCallback(async () => {
        try {
            const response = await getAllBrands()
            if (response.data) {
                setBrands(response.data)
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
        }
    }, [])

    useEffect(() => {
        if (params.id) {
            fetchModel()
            fetchBrands()
        }
    }, [params.id, fetchModel, fetchBrands])

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

    if (!model) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Model not found</CardTitle>
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
                        <BreadcrumbLink href="/models">Models</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/models/${model.id}`}>{model.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{model.name}</CardTitle>
                            <CardDescription>Brand: {model.brandName}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <Badge variant="outline">ID: {model.id}</Badge>
                            </div>
                            <EditModelModal 
                                model={model} 
                                brands={brands}
                                onSuccess={fetchModel} 
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Model name</h3>
                                <p className="text-muted-foreground">{model.name}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Slug</h3>
                                <p className="text-muted-foreground">N/A</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Brand</h3>
                                <Badge variant="outline">{model.brandName}</Badge>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">ID Brand</h3>
                                <p className="text-muted-foreground">{model.brandId}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Created</h3>
                                <p className="text-muted-foreground">
                                    {new Date(model.createdAt).toLocaleDateString('uk-UA')}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Updated</h3>
                                <p className="text-muted-foreground">
                                    {new Date(model.updatedAt).toLocaleDateString('uk-UA')}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 