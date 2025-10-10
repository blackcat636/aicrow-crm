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
import React, { useState, useCallback } from "react"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Textarea } from "../ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocationsStore } from "@/store/useLocationsStore"
import { CreateLocationDto } from "@/interface/Location"
import { getTimezones, Timezone } from "@/lib/api/locations"

interface AddLocationModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddLocationModal({ open: externalOpen, onOpenChange, onSuccess }: AddLocationModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;
    const [isLoading, setIsLoading] = useState(false);
    const [timezones, setTimezones] = useState<Timezone[]>([]);
    const [timezonesLoading, setTimezonesLoading] = useState(false);
    const { addLocation } = useLocationsStore();
    const [formData, setFormData] = useState<CreateLocationDto>({
        name: "",
        address: "",
        city: "",
        country: "",
        latitude: 0,
        longitude: 0,
        description: "",
        timezone: "",
        isActive: true,
    });


    const loadTimezones = useCallback(async () => {
        if (timezones.length > 0) {
            return; // Already loaded
        }
        
        setTimezonesLoading(true);
        try {
            const timezonesData = await getTimezones();
            setTimezones(timezonesData);
        } catch (error) {
            console.error('Error loading timezones:', error);
            toast.error('Failed to load timezones');
        } finally {
            setTimezonesLoading(false);
        }
    }, [timezones.length]);

    // Load timezones when modal opens
    React.useEffect(() => {
        if (open) {
            loadTimezones();
        }
    }, [open, loadTimezones]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            loadTimezones();
        }
    }, [loadTimezones, setOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate coordinates
        if (formData.latitude < -90 || formData.latitude > 90) {
            toast.error("Latitude must be between -90 and 90 degrees");
            return;
        }
        if (formData.longitude < -180 || formData.longitude > 180) {
            toast.error("Longitude must be between -180 and 180 degrees");
            return;
        }
        
        setIsLoading(true);

        try {
            await addLocation(formData);
            toast.success("Location added successfully");
            setOpen(false);
            onSuccess();
            setFormData({
                name: "",
                address: "",
                city: "",
                country: "",
                latitude: 0,
                longitude: 0,
                description: "",
                timezone: "",
                isActive: true,
            });
        } catch (error) {
            console.error("❌ Error creating location:", error)
            toast.error("Error adding location");
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
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add new location</DialogTitle>  
                        <DialogDescription>
                            Add a new location for your business
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
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                autoComplete="off"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    autoComplete="off"
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    autoComplete="off"
                                    value={formData.country}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    min="-90"
                                    max="90"
                                    autoComplete="off"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    min="-180"
                                    max="180"
                                    autoComplete="off"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                value={formData.timezone}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                                disabled={timezonesLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={timezonesLoading ? "Loading timezones..." : "Select timezone"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {timezones.map((timezone) => (
                                        <SelectItem key={timezone.name} value={timezone.name}>
                                            {timezone.name} {timezone.offset && `(${timezone.offset})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
        </div>
    );
}
