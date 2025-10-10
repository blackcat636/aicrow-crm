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
import { Switch } from "@/components/ui/switch"
import { useBookingOptionVariantsStore } from "@/store/useBookingOptionVariantsStore"
import { BookingOptionVariant, UpdateBookingOptionVariantDto } from "@/interface/BookingOptionType"

interface FormData {
  displayName: string
  description: string
  price: number
  value: string
  isActive: boolean
  isDefault: boolean
  icon: string
  sortOrder: number
}

interface EditBookingOptionVariantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: BookingOptionVariant
}

export function EditBookingOptionVariantModal({
  open,
  onOpenChange,
  variant,
}: EditBookingOptionVariantModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateVariant } = useBookingOptionVariantsStore()

  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    description: "",
    price: 0,
    value: "",
    isActive: true,
    isDefault: false,
    icon: "",
    sortOrder: 0,
  })

  // Update form when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        displayName: variant.displayName,
        description: variant.description || "",
        price: variant.price,
        value: variant.value || "",
        isActive: variant.isActive,
        isDefault: variant.isDefault,
        icon: variant.icon || "",
        sortOrder: variant.sortOrder || 0,
      })
    }
  }, [variant])

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
      const updateData: UpdateBookingOptionVariantDto = {
        displayName: formData.displayName,
        description: formData.description,
        price: formData.price,
        value: formData.value,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        icon: formData.icon,
        sortOrder: formData.sortOrder,
      }
      await updateVariant(variant.id, updateData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating variant:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        displayName: "",
        description: "",
        price: 0,
        value: "",
        isActive: true,
        isDefault: false,
        icon: "",
        sortOrder: 0,
      })
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Option Variant</DialogTitle>
          <DialogDescription>
            Update settings for variant &quot;{variant.displayName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Basic Insurance"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                <strong>Unique name:</strong> {variant.name}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Variant description..."
              className="resize-none"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Variant price
              </p>
            </div>
            <div>
              <Label htmlFor="value">Value (optional)</Label>
              <Input
                id="value"
                placeholder="1000"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Additional variant value
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                placeholder="0"
                value={formData.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Display order for variants
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Variant will be available for selection
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Default</Label>
                <p className="text-sm text-muted-foreground">
                  This variant will be selected automatically
                </p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange('isDefault', checked)}
              />
            </div>
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