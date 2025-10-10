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
import { getAllBrands } from "@/lib/api/brands"
import { getAllColors } from "@/lib/api/colors"
import { getAllCategories } from "@/lib/api/categories"
import { getAllLocations } from "@/lib/api/locations"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { IconPlus } from "@tabler/icons-react"
import { createCar } from "@/lib/api/cars"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brand } from "@/interface/Brand"
import { Model } from "@/interface/Model"
import { Color } from "@/interface/Color"
import { Category } from "@/interface/Category"
import { Location } from "@/interface/Location"
import { Textarea } from "../ui/textarea"
import { getAllModels } from "@/lib/api/models"
import { AddBrandModal } from "@/components/brands/add-brand-modal"
import { AddModelModal } from "@/components/models/add-model-modal"
import { AddColorModal } from "@/components/colors/add-color-modal"
import { AddCategoryModal } from "@/components/categories/add-category-modal"
import { AddLocationModal } from "@/components/locations/add-location-modal"

interface AddCarsModalProps {
    onSuccess: () => void;
}

export function AddCarsModal({ onSuccess }: AddCarsModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [allModels, setAllModels] = useState<Model[]>([]); // All models
    const [filteredModels, setFilteredModels] = useState<Model[]>([]); // Filtered models
    const [colors, setColors] = useState<Color[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [colorModalOpen, setColorModalOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        year: 0,
        categoryId: "",
        rentalPrice: 0,
        transmission: "",
        fuel: "",
        seats: 0,
        available: false,
        brandId: "",
        modelId: "",
        colorId: "",
        locationId: "",
    });

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [brandsResponse, colorsResponse, modelsResponse, categoriesResponse, locationsResponse] = await Promise.all([
                    getAllBrands(),
                    getAllColors(),
                    getAllModels(),
                    getAllCategories(),
                    getAllLocations()
                ]);
                
                if (brandsResponse.status === 'success' && brandsResponse.data) {
                    setBrands(brandsResponse.data);
                }
                
                if ((colorsResponse.status === 'success' || colorsResponse.status === 200) && colorsResponse.data) {
                    setColors(colorsResponse.data);
                }

                if (modelsResponse.status === 'success' && modelsResponse.data) {
                    setAllModels(modelsResponse.data);
                }

                if ((categoriesResponse.status === 200 || categoriesResponse.status === 0) && categoriesResponse.data) {
                    setCategories(categoriesResponse.data);
                }

                if ((locationsResponse.status === 200 || locationsResponse.status === 0) && locationsResponse.data) {
                    setLocations(locationsResponse.data);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (formData.brandId) {
            // Filter models by selected brand
            const filtered = allModels.filter(model => model.brandId === Number(formData.brandId));
            setFilteredModels(filtered);
        } else {
            setFilteredModels([]);
        }
    }, [formData.brandId, allModels]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Convert strings to numbers before sending
            const carData = {
                ...formData,
                brandId: Number(formData.brandId),
                modelId: Number(formData.modelId),
                colorId: Number(formData.colorId),
                categoryId: Number(formData.categoryId),
                locationId: Number(formData.locationId)
            };
            
            const response = await createCar(carData);
            
            if (response.status === 'success' || response.status === 201) {
                toast.success("Car added successfully");
                setOpen(false);
                onSuccess();
                setFormData({
                    name: "",
                    description: "",
                    year: 0,
                    categoryId: "",
                    rentalPrice: 0,
                    transmission: "",
                    fuel: "",
                    seats: 0,
                    available: false,
                    brandId: "",
                    modelId: "",
                    colorId: "",
                    locationId: "",
                });
            } else {
                toast.error(response.message || "Error adding car");
            }
        } catch (error) {
            console.error("❌ Error creating car:", error)
            toast.error("Error adding car");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end">
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <Button variant="outline" onClick={() => { setOpen(true)}}>
                    <IconPlus suppressHydrationWarning /> Add car
                </Button>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add new car</DialogTitle>  
                        <DialogDescription>
                            Add a new car for your business
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
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                min={1900}
                                max={new Date().getFullYear()}
                                name="year"
                                autoComplete="off"
                                value={formData.year}
                                onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rentalPrice">Rental price</Label>
                            <Input
                                id="rentalPrice"
                                name="rentalPrice"
                                autoComplete="off"
                                value={formData.rentalPrice}
                                onChange={(e) => setFormData(prev => ({ ...prev, rentalPrice: Number(e.target.value) }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transmission">Transmission</Label>
                            <Select
                                value={formData.transmission}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select transmission" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manual">Manual</SelectItem>
                                    <SelectItem value="Automatic">Automatic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fuel">Fuel</Label>
                            <Select
                                value={formData.fuel}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, fuel: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Electric">Electric</SelectItem>
                                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                                    <SelectItem value="Diesel">Diesel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seats">Number of seats</Label>
                            <Input
                                id="seats"
                                name="seats"
                                autoComplete="off"
                                value={formData.seats}
                                onChange={(e) => setFormData(prev => ({ ...prev, seats: Number(e.target.value) }))}
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="available"
                                checked={formData.available}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
                            />
                            <Label htmlFor="available">Available</Label>
                        </div>  
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <div className="flex items-center gap-2">
                                <div>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories
                                                .filter(category => category.isActive)
                                                .map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AddCategoryModal onSuccess={() => {
                                    getAllCategories().then((response) => {
                                        if ((response.status === 200 || response.status === 0) && response.data) {
                                            setCategories(response.data);
                                        }
                                    });
                                }} />
                            </div>
                        </div>                        
                        <div className="space-y-2">
                            <Label htmlFor="brandId">Brand</Label>
                            <div className="flex items-center gap-2">
                                <div>
                                    <Select
                                        value={formData.brandId}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                brandId: value,
                                                modelId: ""
                                            }));
                                        }}
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
                                <AddBrandModal onSuccess={() => {
                                    getAllBrands().then((response) => {
                                        if (response.status === 'success' && response.data) {
                                            setBrands(response.data);
                                        }
                                    });
                                }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modelId">Model</Label>
                            <div className="flex items-center gap-2">
                                <div>
                                    <Select
                                        value={formData.modelId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, modelId: value }))}
                                        disabled={!formData.brandId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredModels.map((model) => (
                                                <SelectItem key={model.id} value={model.id.toString()}>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AddModelModal onSuccess={() => {
                                    getAllModels().then((response) => {
                                        if (response.status === 'success' && response.data) {
                                            setAllModels(response.data);
                                            if (formData.brandId) {
                                                setFilteredModels(response.data.filter(model => 
                                                    model.brandId === parseInt(formData.brandId)
                                                ));
                                            }
                                        }
                                    });
                                }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="colorId">Color</Label>
                            <div className="flex items-center gap-2">
                                <div>
                                    <Select
                                        value={formData.colorId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, colorId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colors.map((color) => (
                                                <SelectItem key={color.id} value={color.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-4 h-4 rounded border" 
                                                            style={{ backgroundColor: `#${color.hexCode}` }}
                                                        />
                                                        {color.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AddColorModal 
                                    open={colorModalOpen}
                                    onOpenChange={setColorModalOpen}
                                    onSuccess={() => {
                                    getAllColors().then((response) => {
                                        if ((response.status === 'success' || response.status === 200) && response.data) {
                                            setColors(response.data);
                                        }
                                    });
                                }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="locationId">Location</Label>
                            <div className="flex items-center gap-2">
                                <div>
                                    <Select
                                        value={formData.locationId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.name} - {location.city}, {location.country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AddLocationModal 
                                    open={locationModalOpen}
                                    onOpenChange={setLocationModalOpen}
                                    onSuccess={() => {
                                        getAllLocations().then((response) => {
                                            if (response.status === 200 && response.data) {
                                                setLocations(response.data);
                                            }
                                        });
                                    }} 
                                />
                            </div>
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
