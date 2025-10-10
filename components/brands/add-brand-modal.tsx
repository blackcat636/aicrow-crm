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
import { createBrand } from "@/lib/api/brands"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { IconPlus } from "@tabler/icons-react"

interface AddBrandModalProps {
    onSuccess: () => void;
}

export function AddBrandModal({ onSuccess }: AddBrandModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        isFeatured: false,
        isPremium: false,
        isNew: false,
        isActive: true,
        sortOrder: 0,
    });

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await createBrand(formData);
            
            if (response.status === 'success') {
                toast.success("Brand added successfully");
                setOpen(false);
                onSuccess();
                setFormData({
                    name: "",
                    slug: "",
                    description: "",
                    isFeatured: false,
                    isPremium: false,
                    isNew: false,
                    isActive: true,
                    sortOrder: 0,
                });
            } else {
                toast.error(response.message || "Error adding brand");
            }
        } catch {
            toast.error("Error adding brand");
        } finally {
            setIsLoading(false);
        }
    };

    return (
     <div className="flex justify-end">
        <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button variant="outline" onClick={() => { setOpen(true)}}>
            <IconPlus suppressHydrationWarning />
        </Button>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add new brand</DialogTitle>
                    <DialogDescription>
                        Add a new brand for your business
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
                        <Textarea
                            id="description"
                            name="description"
                            autoComplete="off"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isFeatured"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked as boolean }))}
                            />
                            <Label htmlFor="isFeatured">Featured</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isNew"
                                name="isNew"
                                checked={formData.isNew}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked as boolean }))}
                            />
                            <Label htmlFor="isNew">New</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPremium"
                                name="isPremium"
                                checked={formData.isPremium}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked as boolean }))}
                            />
                            <Label htmlFor="isPremium">Premium</Label>
                        </div>
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
