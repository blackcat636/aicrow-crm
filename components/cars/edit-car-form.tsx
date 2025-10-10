"use client"

import { useState, useEffect } from 'react'
import { Car } from '@/interface/Cars'
import { Location } from '@/interface/Location'
import { Category } from '@/interface/Category'
import { getAllLocations } from '@/lib/api/locations'
import { getAllCategories } from '@/lib/api/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface FormData {
  name: string
  brandId: number
  modelId: number
  colorId: number
  year: number
  rentalPrice: number
  description: string
  categoryId: number
  fuel: string
  transmission: string
  seats: number
  locationId: number
  available: boolean
}

interface EditCarFormProps {
  car: Car | null
  onSubmit: (data: FormData) => void
  isLoading: boolean
}

export function EditCarForm({ car, onSubmit, isLoading }: EditCarFormProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    brandId: 0,
    modelId: 0,
    colorId: 0,
    year: 0,
    rentalPrice: 0,
    description: '',
    categoryId: 0,
    fuel: '',
    transmission: '',
    seats: 0,
    locationId: 0,
    available: true
  })

  useEffect(() => {
    if (car) {
      const locationId = car.location?.id || 0;
      console.log('🚗 EditCarForm - Setting form data:', {
        carLocation: car.location,
        locationId,
        carName: car.name,
        hasLocation: !!car.location,
        locationIdIsZero: locationId === 0
      });
      
      setFormData({
        name: car.name || '',
        brandId: car.brand?.id || 0,
        modelId: car.model?.id || 0,
        colorId: car.color?.id || 0,
        year: car.year || 0,
        rentalPrice: parseFloat(String(car.rentalPrice || '0')),
        description: car.description || '',
        categoryId: typeof car.category === 'object' ? car.category?.id || 0 : 0,
        fuel: car.fuel || '',
        transmission: car.transmission || '',
        seats: car.seats || 0,
        locationId: locationId,
        available: car.available || false
      });
    }
  }, [car])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsResponse, categoriesResponse] = await Promise.all([
          getAllLocations(),
          getAllCategories()
        ])
        
        if ((locationsResponse.status === 200 || locationsResponse.status === 0) && locationsResponse.data) {
          setLocations(locationsResponse.data)
        }
        
        if ((categoriesResponse.status === 200 || categoriesResponse.status === 0) && categoriesResponse.data) {
          setCategories(categoriesResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field === 'locationId') {
      console.log('🚗 EditCarForm - Changing locationId:', { field, value, currentFormData: formData });
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Debug current formData
  useEffect(() => {
    console.log('🚗 EditCarForm - formData changed:', formData);
  }, [formData]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select key={`category-${formData.categoryId}`} value={formData.categoryId.toString()} onValueChange={(value) => handleChange('categoryId', parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rentalPrice">Price per day (CAD)</Label>
          <Input
            id="rentalPrice"
            type="number"
            step="0.01"
            value={formData.rentalPrice}
            onChange={(e) => handleChange('rentalPrice', parseFloat(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fuel">Fuel</Label>
          <Select key={`fuel-${formData.fuel}`} value={formData.fuel} onValueChange={(value) => handleChange('fuel', value)}>
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
        <div>
          <Label htmlFor="transmission">Transmission</Label>
          <Select key={`transmission-${formData.transmission}`} value={formData.transmission} onValueChange={(value) => handleChange('transmission', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seats">Number of seats</Label>
          <Input
            id="seats"
            type="number"
            min="1"
            max="9"
            value={formData.seats}
            onChange={(e) => handleChange('seats', parseInt(e.target.value))}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="available"
            checked={formData.available}
            onCheckedChange={(checked) => handleChange('available', checked)}
          />
          <Label htmlFor="available">Available</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="locationId">Location</Label>
        <Select
          key={`location-${formData.locationId}-${locations.length}`}
          value={formData.locationId > 0 ? formData.locationId.toString() : ""}
          onValueChange={(value) => handleChange('locationId', parseInt(value))}
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
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-1">
            Debug: locationId={formData.locationId}, locations={locations.length}, selectValue={formData.locationId > 0 ? formData.locationId.toString() : ""}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {/* Close dialog */}}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
