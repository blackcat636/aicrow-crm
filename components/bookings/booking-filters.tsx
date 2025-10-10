"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconSearch, IconX, IconCalendar } from "@tabler/icons-react"
import { BookingQueryDto } from "@/interface/Booking"

interface BookingFiltersProps {
  query: BookingQueryDto
  onQueryChange: (query: Partial<BookingQueryDto>) => void
  onClearFilters: () => void
}

const bookingStatuses: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'converted_to_long_term', label: 'Converted to Long Term' }
]

const paymentStatuses: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'released', label: 'Released' },
  { value: 'refunded', label: 'Refunded' }
]

export function BookingFilters({ query, onQueryChange, onClearFilters }: BookingFiltersProps) {
  const handleSearchChange = (value: string) => {
    onQueryChange({ search: value || undefined })
  }

  const handleStatusChange = (value: string) => {
    onQueryChange({ status: value as string })
  }

  const handlePaymentStatusChange = (value: string) => {
    onQueryChange({ paymentStatus: value as string })
  }

  const handleStartDateChange = (value: string) => {
    onQueryChange({ startDate: value || undefined })
    
    // If end date is set and is before start date, clear it
    if (value && query.endDate && new Date(value) > new Date(query.endDate)) {
      onQueryChange({ endDate: undefined })
    }
  }

  const handleEndDateChange = (value: string) => {
    onQueryChange({ endDate: value || undefined })
    
    // If start date is set and is after end date, clear it
    if (value && query.startDate && new Date(query.startDate) > new Date(value)) {
      onQueryChange({ startDate: undefined })
    }
  }


  const hasActiveFilters = query.search || query.status || query.paymentStatus || query.startDate || query.endDate

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter bookings by status, payment, or search by vehicle/user
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground"
            >
              <IconX className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* All filters in one row */}
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by vehicle/user name, email..."
                  value={query.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Booking Status */}
            <div className="space-y-2">
              <Label>Booking Status</Label>
              <Select
                value={query.status || undefined}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {bookingStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={query.paymentStatus || undefined}
                onValueChange={handlePaymentStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <IconCalendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={query.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="pl-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById('startDate') as HTMLInputElement
                    input?.showPicker?.()
                  }}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <IconCalendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="endDate"
                  type="date"
                  value={query.endDate || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="pl-10 cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById('endDate') as HTMLInputElement
                    input?.showPicker?.()
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
