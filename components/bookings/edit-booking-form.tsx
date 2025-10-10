"use client"

import { useState, useEffect } from 'react'
import { BookingDetail } from '@/interface/Booking'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface EditBookingFormProps {
  booking: BookingDetail | null
  onSubmit: (data: Partial<BookingDetail>) => void
  isLoading: boolean
}

export function EditBookingForm({ booking, onSubmit, isLoading }: EditBookingFormProps) {
  const [formData, setFormData] = useState<Partial<BookingDetail>>({
    status: undefined,
    notes: '',
    pickupLocation: '',
    returnLocation: '',
    insurance: false
  })

  useEffect(() => {
    if (booking) {
      const initialData = {
        status: booking.status || '',
        notes: booking.notes || '',
        pickupLocation: booking.pickupLocation || '',
        returnLocation: booking.returnLocation || '',
        insurance: booking.insurance || false
      }
      setFormData(initialData)
    }
  }, [booking])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Booking Status</Label>
        <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pickupLocation">Pickup Location</Label>
          <Input
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) => handleChange('pickupLocation', e.target.value)}
            placeholder="Enter pickup location"
          />
        </div>
        <div>
          <Label htmlFor="returnLocation">Return Location</Label>
          <Input
            id="returnLocation"
            value={formData.returnLocation}
            onChange={(e) => handleChange('returnLocation', e.target.value)}
            placeholder="Enter return location"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="insurance"
          checked={formData.insurance}
          onCheckedChange={(checked) => handleChange('insurance', checked)}
        />
        <Label htmlFor="insurance">Insurance Included</Label>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          placeholder="Enter notes"
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
