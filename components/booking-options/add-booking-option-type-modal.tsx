"use client"

import { useState } from "react"
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

interface FormData {
  name: string
  displayName: string
  description: string
  pricingType: 'fixed_per_day' | 'percentage'
  basePrice: number
  isActive: boolean
  isRequired: boolean
  icon: string
  hasVariants: boolean
}

interface AddBookingOptionTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookingOptionTypeModal({
  open,
  onOpenChange,
}: AddBookingOptionTypeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { createOptionType } = useBookingOptionTypesStore()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    displayName: "",
    description: "",
    pricingType: "fixed_per_day",
    basePrice: 0,
    isActive: true,
    isRequired: false,
    icon: "",
    hasVariants: false,
  })

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
      await createOptionType(formData)
      setFormData({
        name: "",
        displayName: "",
        description: "",
        pricingType: "fixed_per_day",
        basePrice: 0,
        isActive: true,
        isRequired: false,
        icon: "",
        hasVariants: false,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating option type:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: "",
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
          <DialogTitle>Add Option Type</DialogTitle>
          <DialogDescription>
            Create a new option type for bookings. Specify a unique name and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name (unique)</Label>
              <Input
                id="name"
                placeholder="child_chair"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Only lowercase letters and underscores
              </p>
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Child Chair"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
              />
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
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
