"use client"

import { useState, useEffect } from 'react'
import { Specification } from '@/interface/Specification'
import { getAllSpecifications } from '@/lib/api/specifications'
import { addVehicleSpecification } from '@/lib/api/cars'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'

interface AddSpecificationModalProps {
  vehicleId: number
  onSuccess: () => void
}

export function AddSpecificationModal({ vehicleId, onSuccess }: AddSpecificationModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false)
  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [selectedSpecificationId, setSelectedSpecificationId] = useState<string>('')
  const [specificationValue, setSpecificationValue] = useState('')

  useEffect(() => {
    if (open) {
      loadSpecifications()
    }
  }, [open])

  const loadSpecifications = async () => {
    try {
      setIsLoadingSpecs(true)
      const response = await getAllSpecifications()
      if (response.status === 'success' && response.data) {
        setSpecifications(response.data)
      } else {
        console.error('Error loading specifications:', response.error)
        toast.error('Failed to load specifications')
        setSpecifications([])
      }
    } catch (error) {
      console.error('Error loading specifications:', error)
      toast.error('Failed to load specifications')
      setSpecifications([])
    } finally {
      setIsLoadingSpecs(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSpecificationId || !specificationValue.trim()) {
      toast.error('Please select a specification and enter a value')
      return
    }

    setIsLoading(true)

    try {
      const response = await addVehicleSpecification(
        vehicleId,
        parseInt(selectedSpecificationId),
        specificationValue.trim()
      )

      if (response.status === 'success') {
        toast.success('Specification added successfully')
        setOpen(false)
        onSuccess()
        // Reset form
        setSelectedSpecificationId('')
        setSpecificationValue('')
      } else {
        toast.error(response.error || 'Failed to add specification')
      }
    } catch (error) {
      console.error('Error adding specification:', error)
      toast.error('Failed to add specification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setSelectedSpecificationId('')
      setSpecificationValue('')
    }
  }

  return (
    <div className="flex justify-end">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Specification
        </Button>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Specification</DialogTitle>
            <DialogDescription>
              Add a new specification to this vehicle
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specification">Specification</Label>
              <Select
                value={selectedSpecificationId}
                onValueChange={setSelectedSpecificationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specification" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingSpecs ? (
                    <SelectItem value="loading" disabled>
                      Loading specifications...
                    </SelectItem>
                  ) : Array.isArray(specifications) && specifications.length > 0 ? (
                    specifications.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id.toString()}>
                        {spec.name} ({spec.type})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-specs" disabled>
                      No specifications available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={specificationValue}
                onChange={(e) => setSpecificationValue(e.target.value)}
                placeholder="Enter specification value"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingSpecs || !selectedSpecificationId || !specificationValue.trim()}>
                {isLoading ? 'Adding...' : 'Add Specification'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
