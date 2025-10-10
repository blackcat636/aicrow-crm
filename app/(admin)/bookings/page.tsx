"use client"
export const runtime = 'edge';
import { useEffect } from 'react'
import { useBookingsStore } from '@/store/useBookingsStore'
import { DataTable } from '@/components/bookings/data-table'
import { BookingStatistics } from '@/components/bookings/booking-statistics'
import { BookingFilters } from '@/components/bookings/booking-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingQueryDto } from '@/interface/Booking'

export default function BookingsPage() {
  const { 
    bookings, 
    allBookings,
    statistics,
    isLoading, 
    error, 
    total, 
    page, 
    limit, 
    currentQuery,
    fetchAllBookings,
    fetchStatistics,
    setQuery,
    clearQuery,
    filterBookings
  } = useBookingsStore()

  useEffect(() => {
    // Load all bookings for client-side filtering
    fetchAllBookings()
    fetchStatistics()
  }, [fetchAllBookings, fetchStatistics])

  // Initial load with first page
  useEffect(() => {
    if (allBookings.length > 0) {
      filterBookings({ page: 1, limit: 10 })
    }
  }, [allBookings, filterBookings])

  const handlePageChange = (newPage: number) => {
    filterBookings({ ...currentQuery, page: newPage, limit })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    filterBookings({ ...currentQuery, page: 1, limit: newPageSize })
  }

  const handleQueryChange = (query: Partial<BookingQueryDto>) => {
    setQuery(query)
    filterBookings({ ...currentQuery, ...query, page: 1 })
  }

  const handleClearFilters = () => {
    clearQuery()
    filterBookings({ page: 1, limit })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Loading Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
          <p className="text-muted-foreground">
            Manage car reservations, payments, and booking statuses
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <BookingStatistics statistics={statistics} isLoading={isLoading} />

      {/* Filters */}
      <BookingFilters
        query={currentQuery}
        onQueryChange={handleQueryChange}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
          <CardDescription>
            View and manage all car reservations with advanced filtering and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={bookings}
            total={total}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
