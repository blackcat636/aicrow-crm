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
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Textarea } from "../ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useCategoriesStore } from "@/store/useCategoriesStore"
import { CreateCategoryDto } from "@/interface/Category"

interface AddCategoryModalProps {
    onSuccess: () => void;
}

export function AddCategoryModal({ onSuccess }: AddCategoryModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { addCategory } = useCategoriesStore();
    const [formData, setFormData] = useState<CreateCategoryDto>({
        name: "",
        description: "",
        isActive: true,
    });

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await addCategory(formData);
            toast.success("Category added successfully");
            setOpen(false);
            onSuccess();
            setFormData({
                name: "",
                description: "",
                isActive: true,
            });
        } catch (error) {
            console.error("❌ Error creating category:", error)
            toast.error("Error adding category");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button variant="outline" size="sm" type="button" onClick={() => { setOpen(true)}}>
                <IconPlus className="h-4 w-4" />
            </Button>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add new category</DialogTitle>  
                    <DialogDescription>
                        Add a new vehicle category
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
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            autoComplete="off"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="isActive">Active</Label>
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
    );
}
