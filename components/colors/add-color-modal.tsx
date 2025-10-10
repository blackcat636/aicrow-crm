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
import { createColor } from "@/lib/api/colors"
import { CreateColorDto } from "@/interface/Color"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"

interface AddColorModalProps {
  onSuccess: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddColorModal({ onSuccess, open, onOpenChange }: AddColorModalProps) {
  const [formData, setFormData] = useState<CreateColorDto>({
    name: "",
    hexCode: "",
    description: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await createColor(formData)
      
      if (response.status === 'success' || response.status === 200 || response.status === 201) {
        toast.success("Color created successfully")
        setFormData({ name: "", hexCode: "", description: "" })
        onOpenChange(false)
        
        setTimeout(() => {
        onSuccess()
        }, 100)
      } else {
        toast.error(response.message || "Error creating color")
      }
    } catch (error) {
      console.error('Error creating color:', error)
      toast.error("Error creating color")
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <>
      <Button variant="outline" onClick={() => onOpenChange(true)}>
        <IconPlus suppressHydrationWarning />
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Color</DialogTitle>
            <DialogDescription>
              Fill out the form to create a new color
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleButtonClick}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
