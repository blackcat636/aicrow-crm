import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useEffect } from "react"
import { updateBrand } from "@/lib/api/brands"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Brand } from "@/interface/Brand"

interface EditBrandModalProps {
    brand: Brand;
    onSuccess: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditBrandModal({ brand, onSuccess, open: externalOpen, onOpenChange }: EditBrandModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Use external open if provided, otherwise internal
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;
    
    const [formData, setFormData] = useState({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        isFeatured: brand.isFeatured,
        isPremium: brand.isPremium,
        isNew: brand.isNew,
        logo: brand.logo || "",
        image: brand.image || "",
    });

    // Update formData when brand changes
    useEffect(() => {
        setFormData({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            description: brand.description || "",
            isFeatured: brand.isFeatured,
            isPremium: brand.isPremium,
            isNew: brand.isNew,
            logo: brand.logo || "",
            image: brand.image || "",
        });
    }, [brand]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, [setOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await updateBrand(formData);
            
            if (response.status === 'success') {
                toast.success("Brand updated successfully");
                setOpen(false);
                onSuccess();
            } else {
                toast.error(response.message || "Error updating brand");
            }
        } catch {
            toast.error("Error updating brand");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Show button only if external open is not provided */}
            {externalOpen === undefined && (
                <Button variant="outline" onClick={() => setOpen(true)}>Edit</Button>
            )}
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Brand</DialogTitle>
                        <DialogDescription>
                            Make changes to brand information
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                autoComplete="off"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                autoComplete="off"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                autoComplete="off"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPremium"
                                checked={formData.isPremium}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: !!checked }))}
                            />
                            <Label htmlFor="isPremium">Premium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isNew"
                                checked={formData.isNew}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: !!checked }))}
                            />
                            <Label htmlFor="isNew">New</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: !!checked }))}
                            />
                            <Label htmlFor="isFeatured">Featured</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
} 
