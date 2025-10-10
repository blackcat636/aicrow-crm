"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useBookingOptionTypesStore } from "@/store/useBookingOptionTypesStore"
import { BookingOptionType, UpdateBookingOptionTypeDto } from "@/interface/BookingOptionType"

interface FormData {
  displayName: string
  description: string
  pricingType: 'fixed_per_day' | 'percentage'
  basePrice: number
  isActive: boolean
  isRequired: boolean
  icon: string
  hasVariants: boolean
}

interface EditBookingOptionTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  optionType: BookingOptionType
}

export function EditBookingOptionTypeModal({
  open,
  onOpenChange,
  optionType,
}: EditBookingOptionTypeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateOptionType } = useBookingOptionTypesStore()

  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    description: "",
    pricingType: "fixed_per_day",
    basePrice: 0,
    isActive: true,
    isRequired: false,
    icon: "",
    hasVariants: false,
  })

  // Update form when optionType changes
  useEffect(() => {
    if (optionType) {
      setFormData({
        displayName: optionType.displayName,
        description: optionType.description || "",
        pricingType: optionType.pricingType,
        basePrice: optionType.basePrice,
        isActive: optionType.isActive,
        isRequired: optionType.isRequired,
        icon: optionType.icon || "",
        hasVariants: optionType.hasVariants,
      })
    }
  }, [optionType])

  const handleChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updateData: UpdateBookingOptionTypeDto = {
        displayName: formData.displayName,
        description: formData.description,
        pricingType: formData.pricingType,
        basePrice: formData.basePrice,
        isActive: formData.isActive,
        isRequired: formData.isRequired,
        icon: formData.icon,
        hasVariants: formData.hasVariants,
      }
      await updateOptionType(optionType.id, updateData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating option type:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        displayName: "",
        description: "",
        pricingType: "fixed_per_day",
        basePrice: 0,
        isActive: true,
        isRequired: false,
        icon: "",
        hasVariants: false,
      })
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Option Type</DialogTitle>
          <DialogDescription>
            Update settings for option type &quot;{optionType.displayName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Child Chair"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                <strong>Unique name:</strong> {optionType.name}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Option description..."
              className="resize-none"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricingType">Pricing Type</Label>
              <Select value={formData.pricingType} onValueChange={(value) => handleChange('pricingType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_per_day">Fixed per day</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.pricingType === "fixed_per_day" 
                  ? "Price per day in dollars" 
                  : "Percentage of base price"
                }
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input
              id="icon"
              placeholder="icon-name"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Icon name from Tabler Icons library
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Option will be available for selection
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Required</Label>
                <p className="text-sm text-muted-foreground">
                  User must select this option
                </p>
              </div>
              <Switch
                checked={formData.isRequired}
                onCheckedChange={(checked) => handleChange('isRequired', checked)}
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Has Variants</Label>
              <p className="text-sm text-muted-foreground">
                Option has multiple choice variants
              </p>
            </div>
            <Switch
              checked={formData.hasVariants}
              onCheckedChange={(checked) => handleChange('hasVariants', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
