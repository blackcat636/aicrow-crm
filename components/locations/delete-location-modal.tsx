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
import { useLocationsStore } from "@/store/useLocationsStore"
import { Location } from "@/interface/Location"

interface DeleteLocationModalProps {
    location: Location;
}

export function DeleteLocationModal({ location }: DeleteLocationModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { deleteLocation } = useLocationsStore();

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            await deleteLocation(location.id);
            toast.success("Location deleted successfully");
            setOpen(false);
        } catch (error) {
            console.error("❌ Error deleting location:", error)
            toast.error("Error deleting location");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button variant="outline" size="sm" onClick={() => { setOpen(true)}}>
                <IconTrash className="h-4 w-4" />
            </Button>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete location</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{location.name}&quot;? This action cannot be undone.
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
