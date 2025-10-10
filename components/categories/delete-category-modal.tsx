import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { IconTrash } from "@tabler/icons-react"
import { useCategoriesStore } from "@/store/useCategoriesStore"
import { Category } from "@/interface/Category"

interface DeleteCategoryModalProps {
    category: Category;
}

export function DeleteCategoryModal({ category }: DeleteCategoryModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { deleteCategory } = useCategoriesStore();

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            await deleteCategory(category.id);
            toast.success("Category deleted successfully");
            setOpen(false);
        } catch (error) {
            console.error("❌ Error deleting category:", error)
            toast.error("Error deleting category");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button variant="outline" size="sm" onClick={() => { setOpen(true)}}>
                <IconTrash className="h-4 w-4" />
            </Button>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Delete category</DialogTitle>  
                    <DialogDescription>
                        Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
