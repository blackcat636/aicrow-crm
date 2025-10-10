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
import { updateColor } from "@/lib/api/colors"
import { Color, UpdateColorDto } from "@/interface/Color"
import { toast } from "sonner"

interface EditColorModalProps {
  color: Color
  onSuccess: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditColorModal({ 
  color, 
  onSuccess,
  open: externalOpen,
  onOpenChange
}: EditColorModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState<UpdateColorDto>({
    id: color.id,
    name: color.name,
    hexCode: color.hexCode,
    description: color.description || ""
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  useEffect(() => {
    setFormData({
      id: color.id,
      name: color.name,
      hexCode: color.hexCode,
      description: color.description || ""
    })
  }, [color])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await updateColor(formData)
      
      if (response.status === 'success' || response.status === 200 || response.status === 201) {
        toast.success("Color updated successfully")
        setOpen(false)
        onSuccess()
      } else {
        toast.error(response.message || "Error updating color")
      }
    } catch (error) {
      console.error('Error updating color:', error)
      toast.error("Error updating color")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {externalOpen === undefined && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Edit
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>
              Make changes to color information
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
                  placeholder="Enter color name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hexCode" className="text-right">
                  Hex Code
                </Label>
                <Input
                  id="hexCode"
                  value={formData.hexCode}
                  onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                  className="col-span-3"
                  placeholder="#000000"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter color description (optional)"
                />
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
