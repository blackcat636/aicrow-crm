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
import { Textarea } from "@/components/ui/textarea"
import { useState, useCallback } from "react"
import { createModel } from "@/lib/api/models"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import { getAllBrands } from "@/lib/api/brands"
import { Brand } from "@/interface/Brand"

interface AddModelModalProps {
    onSuccess: () => void;
}

export function AddModelModal({ onSuccess }: AddModelModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        brandId: "",
    });

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await getAllBrands();
                if (response.status === 'success' && response.data) {
                    setBrands(response.data);
                }
            } catch (error) {
                console.error("Error loading brands:", error);
            }
        };

        if (open) {
            fetchBrands();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await createModel({
                ...formData,
                brandId: Number(formData.brandId),
            });
            
            if (response.status === 'success') {
                toast.success("Model added successfully");
                setOpen(false);
                onSuccess();
                setFormData({
                    name: "",
                    slug: "",
                    description: "",
                    brandId: "",
                });
            } else {
                toast.error(response.message || "Error adding model");
            }
        } catch {
            toast.error("Error adding model");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end">
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <Button variant="outline" onClick={() => setOpen(true)}>
                    <IconPlus suppressHydrationWarning />
                </Button>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Model</DialogTitle>
                        <DialogDescription>
                            Add a new model for the selected brand
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="brandId">Brand</Label>
                            <Select
                                value={formData.brandId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                placeholder="Enter model slug"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                autoComplete="off"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter model description"
                                required
                                rows={3}
                            />
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
        </div>
    );
} 
