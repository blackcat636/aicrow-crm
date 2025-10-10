"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateModel } from "@/lib/api/models"
import { Model, UpdateModelDto } from "@/interface/Model"
import { Brand } from "@/interface/Brand"
import { toast } from "sonner"

interface EditModelModalProps {
  model: Model
  brands: Brand[]
  onSuccess: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditModelModal({ 
  model, 
  brands, 
  onSuccess,
  open: externalOpen,
  onOpenChange
}: EditModelModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState<UpdateModelDto>({
    id: model.id,
    name: model.name,
    slug: model.slug || "",
    description: model.description || "",
    brandId: model.brandId || 0
  })
  const [isLoading, setIsLoading] = useState(false)
  
  // Use external open if provided, otherwise internal
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Update formData when model changes
  useEffect(() => {
    setFormData({
      id: model.id,
      name: model.name,
      brandId: model.brandId || 0
    })
  }, [model])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await updateModel(formData)
      
      if (response.status === 'success' || response.status === 200) {
        toast.success("Model successfully updated")
        setOpen(false)
        onSuccess()
      } else {
        toast.error(response.message || "Error updating model")
      }
    } catch (error) {
      console.error('Error updating model:', error)
      toast.error("Error updating model")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Show button only if external open is not provided */}
      {externalOpen === undefined && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Edit
      </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit model</DialogTitle>
            <DialogDescription>
              Make changes to the model information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter model name"
                required
              />
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter model slug"
                required
              />
            </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter model description"
                  rows={3}
                required
              />
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right">
                  Brand
                </Label>
              <Select
                value={formData.brandId?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, brandId: parseInt(value) })}
              >
                  <SelectTrigger className="col-span-3">
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 
