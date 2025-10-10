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
import { loadLogoBrand } from "@/lib/api/brands"
import { toast } from "sonner"
import { Brand } from "@/interface/Brand"

interface LoadLogoBrandModalProps {
    brand: Brand;
    onSuccess: () => void;
}

export function LoadLogoBrandModal({ brand, onSuccess }: LoadLogoBrandModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSelectedFile(null);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a file");
            return;
        }

        setIsLoading(true);

        try {
            const response = await loadLogoBrand(brand.id, selectedFile);
            
            if (response.status === 'success') {
                toast.success("Logo uploaded successfully");
                setOpen(false);
                onSuccess();
            } else {
                toast.error(response.message || "Error uploading logo");
            }
        } catch {
            toast.error("Error uploading logo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button variant="outline" onClick={() => setOpen(true)}>Upload Logo</Button>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Logo</DialogTitle>
                    <DialogDescription>
                        Upload logo for brand
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo</Label>
                        <Input
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setSelectedFile(file);
                                }
                            }}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
