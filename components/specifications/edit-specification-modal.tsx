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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateSpecification } from "@/lib/api/specifications"
import { Specification, UpdateSpecificationDto } from "@/interface/Specification"
import { toast } from "sonner"

interface EditSpecificationModalProps {
  specification: Specification
  onSuccess: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditSpecificationModal({ 
  specification, 
  onSuccess,
  open: externalOpen,
  onOpenChange
}: EditSpecificationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState<UpdateSpecificationDto>({
    id: specification.id,
    name: specification.name,
    type: specification.type
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  useEffect(() => {
    setFormData({
      id: specification.id,
      name: specification.name,
      type: specification.type
    })
  }, [specification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await updateSpecification(formData)
      
      if (response.status === 'success' || response.status === 200 || response.status === 201) {
        toast.success("Specification updated successfully")
        setOpen(false)
        onSuccess()
      } else {
        toast.error(response.message || "Error updating specification")
      }
    } catch (error) {
      console.error('Error updating specification:', error)
      toast.error("Error updating specification")
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
            <DialogTitle>Edit specification</DialogTitle>
            <DialogDescription>
              Make changes to the specification information
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
                  placeholder="Enter specification name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                    <SelectItem value="select">Select from list</SelectItem>
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
