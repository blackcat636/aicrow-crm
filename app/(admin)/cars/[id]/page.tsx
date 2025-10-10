"use client"
export const runtime = 'edge';

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car } from "@/interface/Cars"
import { getCarById } from "@/lib/api/cars"
import { IconArrowLeft, IconEdit, IconTrash, IconUpload, IconX, IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"
import { Toaster } from "sonner"
import { useCarsStore } from "@/store/useCarsStore"
import { EditCarForm } from "@/components/cars/edit-car-form"
import { AddSpecificationModal } from "@/components/cars/add-specification-modal"
import Image from "next/image"

export default function CarPage() {
    const params = useParams()
    const carId = params.id as string
    const [car, setCar] = useState<Car | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { uploadCarImage, updateCar, deleteCar: deleteCarFromStore } = useCarsStore()

    useEffect(() => {
        const fetchCar = async () => {
            if (!carId) return
            
            setLoading(true)
            setError(null)
            
            try {
                const response = await getCarById(parseInt(carId))
                
                if (response.status === 'success' && response.data) {
                    setCar(response.data)
                } else {
                                    console.error('❌ Loading error:', response.error)
                    setError(response.error || 'Error loading car')
                }
            } catch (err) {
                console.error('❌ Error:', err)
                setError('Error loading car')
            } finally {
                setLoading(false)
            }
        }

        fetchCar()
    }, [carId])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }
            // Check file size (maximum 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should not exceed 10MB')
                return
            }
            setSelectedFile(file)
            
            // Create URL for preview
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file')
            return
        }

        setUploading(true)
        try {
            // Use store to upload photo
            await uploadCarImage(parseInt(carId), selectedFile)
            
            toast.success('Photo uploaded successfully!')
            
            // Update local state with data from store
            const response = await getCarById(parseInt(carId))
            if (response.status === 'success' && response.data) {
                setCar(response.data)
            }
            
            // Close dialog and clear state
            setIsUploadDialogOpen(false)
            setSelectedFile(null)
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            setPreviewUrl(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('❌ Error uploading:', error)
            toast.error('Error uploading photo')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleEdit = async (formData: {
        name: string;
        brandId: number;
        modelId: number;
        colorId: number;
        year: number;
        rentalPrice: number;
        description: string;
        categoryId: number;
        fuel: string;
        transmission: string;
        seats: number;
        locationId: number;
        available: boolean;
    }) => {
        if (!car) return
        
        setIsUpdating(true)
        try {
            await updateCar(parseInt(carId), formData)
            toast.success('Car updated successfully!')
            
            // Update local state
            const response = await getCarById(parseInt(carId))
            if (response.status === 'success' && response.data) {
                setCar(response.data)
            }
            
            setIsEditDialogOpen(false)
        } catch (error) {
            console.error('❌ Update error:', error)
            toast.error('Error updating car')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!car) return
        
        setIsDeleting(true)
        try {
            await deleteCarFromStore(parseInt(carId))
            toast.success('Car deleted successfully!')
            
            // Redirect to cars list
            window.location.href = '/cars'
        } catch (error) {
            console.error('❌ Delete error:', error)
            toast.error('Error deleting car')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleActivate = async () => {
        if (!car) return
        
        try {
            const { activateCar } = useCarsStore.getState()
            await activateCar(car.id)
            toast.success('Car activated successfully!')
            // Reload the page to refresh all data
            setTimeout(() => {
                window.location.reload()
            }, 1000)
            
        } catch (error) {
            console.error('❌ Activate error:', error)
            toast.error('Error activating car')
        }
    }

    const handleDeactivate = async () => {
        if (!car) return
        
        try {
            const { deactivateCar } = useCarsStore.getState()
            await deactivateCar(car.id)
            toast.success('Car deactivated successfully!')
            // Reload the page to refresh all data
            setTimeout(() => {
                window.location.reload()
            }, 1000)
            
        } catch (error) {
            console.error('❌ Deactivate error:', error)
            toast.error('Error deactivating car')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
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
                        <Button asChild className="mt-4">
                            <Link href="/cars">
                                <IconArrowLeft className="mr-2 h-4 w-4" />
                                Back to list
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!car) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Car not found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Car with ID {carId} does not exist.</p>
                        <Button asChild className="mt-4">
                            <Link href="/cars">
                                <IconArrowLeft className="mr-2 h-4 w-4" />
                                Back to list
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/cars">Cars</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/cars/${car.id}`}>{car.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6 space-y-6">
                {/* Main information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{car.name}</CardTitle>
                                <CardDescription>ID: {car.id}</CardDescription>
                                {car.location && (
                                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                        <span>📍</span>
                                        <span>{car.location.name} - {car.location.city}, {car.location.country}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    {car.available ? (
                                        <Badge variant="secondary" className="text-green-500">
                                            Available
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-red-500">
                                            Unavailable
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {car.available ? (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleDeactivate}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <IconX className="mr-2 h-4 w-4" />
                                            Deactivate
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleActivate}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <IconCheck className="mr-2 h-4 w-4" />
                                            Activate
                                        </Button>
                                    )}
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <IconEdit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit car</DialogTitle>
                                                <DialogDescription>
                                                    Make changes to car information
                                                </DialogDescription>
                                            </DialogHeader>
                                            <EditCarForm 
                                                car={car} 
                                                onSubmit={handleEdit}
                                                isLoading={isUpdating}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    
                                    {/* Photo upload button with dialog */}
                                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <IconUpload className="mr-2 h-4 w-4" />
                                                Upload photo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Upload photo</DialogTitle>
                                                <DialogDescription>
                                                    Select an image file to upload
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="file" className="text-right">
                                                        File
                                                    </Label>
                                                    <div className="col-span-3">
                                                        <Input
                                                            id="file"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileSelect}
                                                            ref={fileInputRef}
                                                            className="cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                                {selectedFile && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">
                                                                    {selectedFile.name}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={handleRemoveFile}
                                                            >
                                                                <IconX className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        {previewUrl && (
                                                            <div className="relative">
                                                                <Image
                                                                    src={previewUrl}
                                                                    alt="Preview"
                                                                    className="w-full h-32 object-cover rounded-md border"
                                                                    width={400}
                                                                    height={128}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsUploadDialogOpen(false)
                                                        // Clear state on close
                                                        setSelectedFile(null)
                                                        if (previewUrl) {
                                                            URL.revokeObjectURL(previewUrl)
                                                        }
                                                        setPreviewUrl(null)
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = ''
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleUpload}
                                                    disabled={!selectedFile || uploading}
                                                >
                                                    {uploading ? 'Uploading...' : 'Upload'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Add Specification button */}
                                    <AddSpecificationModal 
                                        vehicleId={parseInt(carId)} 
                                        onSuccess={() => {
                                            // Refresh car data after adding specification
                                            const refreshCar = async () => {
                                                try {
                                                    const response = await getCarById(parseInt(carId))
                                                    if (response.status === 'success' && response.data) {
                                                        setCar(response.data)
                                                    }
                                                } catch (error) {
                                                    console.error('Error refreshing car data:', error)
                                                }
                                            }
                                            refreshCar()
                                        }} 
                                    />

                                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <IconTrash className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader className="text-center">
                                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                                    <IconAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                </div>
                                                <DialogTitle className="text-xl font-semibold">
                                                    Delete car
                                                </DialogTitle>
                                                <DialogDescription className="text-base">
                                                    Are you sure you want to delete this car? This action cannot be undone.
                                                    {car && (
                                                        <span className="block mt-2 font-medium text-foreground">
                                                            &ldquo;{car.name}&rdquo;
                                                        </span>
                                                    )}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsDeleteDialogOpen(false)}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <IconX className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Car photos */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Photos</h3>
                                {car.media && car.media.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {car.media.slice(0, 4).map((media, index) => {
                                            // Construct full URL for the image
                                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
                                            const fullImageUrl = media.url.startsWith('http') 
                                                ? media.url 
                                                : `${baseUrl}${media.url.startsWith('/') ? '' : '/'}${media.url}`;
                                            
                                            // Debug URL construction
                                            if (process.env.NODE_ENV === 'development') {
                                                console.log('Image URL construction:', {
                                                    originalUrl: media.url,
                                                    baseUrl,
                                                    fullImageUrl
                                                });
                                            }
                                            
                                            return (
                                                <div key={index} className="relative">
                                                    {typeof media.url === 'string' && !media.url.includes('[object File]') ? (
                                                        <Image
                                                            src={fullImageUrl.replace(/\s+/g, '%20')}
                                                            alt={`${car.name} ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-md"
                                                            width={100}
                                                            height={96}
                                                            onError={(e) => {
                                                                console.error('❌ Error loading photo:', media.url)
                                                                console.error('❌ Full URL:', fullImageUrl)
                                                                e.currentTarget.style.display = 'none';
                                                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                                                if (placeholder) {
                                                                    placeholder.style.display = 'flex';
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-24 bg-red-200 rounded-md flex items-center justify-center text-red-600 text-xs">
                                                            {media.url.includes('[object File]') ? 'Invalid file' : 'Invalid URL'}
                                                        </div>
                                                    )}
                                                    <div 
                                                        className="w-full h-24 bg-gray-200 rounded-md items-center justify-center text-gray-500 text-xs"
                                                        style={{ display: 'none' }}
                                                    >
                                                        Photo unavailable
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                        No photos
                                    </div>
                                )}
                            </div>

                            {/* Main characteristics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Main characteristics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Brand:</span>
                                        <span>{car.brand?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Model:</span>
                                        <span>{car.model?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Year:</span>
                                        <span>{car.year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category:</span>
                                        <Badge variant="outline">{typeof car.category === 'object' ? car.category?.name : car.category || 'N/A'}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Color:</span>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{ backgroundColor: `#${car.color?.hexCode}` }}
                                            />
                                            <span>{car.color?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location:</span>
                                        <div className="flex items-center gap-2">
                                            <span>📍</span>
                                            <div className="text-right">
                                                <div className="font-medium">{car.location?.name || 'No location'}</div>
                                                {car.location && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {car.location.city}, {car.location.country}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical specifications */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Technical specifications</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Price:</span>
                                        <span className="font-semibold">${car.rentalPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rating:</span>
                                        <span>{car.rating}/5</span> 
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Transmission:</span>
                                        <span>{car.transmission}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Fuel:</span>
                                        <span>{car.fuel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Seats:</span>
                                        <span>{car.seats}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {car.description && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground">{car.description}</p>
                            </div>
                        )}

                        {/* Specifications */}
                        {car.specifications && car.specifications.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {car.specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-muted-foreground">{spec.name}:</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Toast notifications */}
            <Toaster />
        </div>
    )
}