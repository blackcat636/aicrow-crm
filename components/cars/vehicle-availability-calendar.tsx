"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconCalendar, IconX, IconCheck, IconRefresh } from "@tabler/icons-react"
import { getVehicleBookedDates } from "@/lib/api/bookings"

interface BookedDate {
  startDate: string
  endDate: string
  status: string
}

interface VehicleAvailabilityCalendarProps {
  vehicleId: number
  vehicleName: string
}

export function VehicleAvailabilityCalendar({ vehicleId, vehicleName }: VehicleAvailabilityCalendarProps) {
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchBookedDates = useCallback(async (forceRefresh = false) => {
    // Rate limiting: only fetch if more than 30 seconds have passed since last fetch or forced refresh
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTime < 30000) {
      console.log('⏳ Rate limiting: skipping fetch, last fetch was', Math.round((now - lastFetchTime) / 1000), 'seconds ago')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Fetching booked dates for vehicle:', vehicleId)
      
      const result = await getVehicleBookedDates(vehicleId)
      console.log('📅 Booked dates result:', result)
      
      if (result.status === 'success' && result.data) {
        setBookedDates(result.data)
        setLastFetchTime(now)
        console.log('✅ Loaded booked dates:', result.data)
      } else {
        const errorMsg = result.error || 'Failed to fetch booked dates'
        console.error('❌ Error loading booked dates:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('❌ Error fetching booked dates:', err)
      setError('Error fetching booked dates')
    } finally {
      setLoading(false)
    }
  }, [vehicleId, lastFetchTime])

  useEffect(() => {
    if (vehicleId) {
      fetchBookedDates()
    }
  }, [vehicleId, fetchBookedDates])

  // Check if a date is booked
  const isDateBooked = (date: string) => {
    return bookedDates.some(booking => {
      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      const checkDate = new Date(date)
      
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  // Get booking status for a specific date
  const getBookingStatus = (date: string) => {
    const booking = bookedDates.find(booking => {
      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      const checkDate = new Date(date)
      
      return checkDate >= startDate && checkDate <= endDate
    })
    
    return booking?.status || null
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())) // End on Saturday
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]
      const isCurrentMonth = date.getMonth() === currentMonth
      const isBooked = isDateBooked(dateString)
      const bookingStatus = getBookingStatus(dateString)
      const isToday = dateString === today.toISOString().split('T')[0]
      
      days.push({
        date: dateString,
        day: date.getDate(),
        isCurrentMonth,
        isBooked,
        bookingStatus,
        isToday
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading availability...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              Availability Calendar - {vehicleName}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBookedDates(true)}
              className="flex items-center gap-2"
            >
              <IconRefresh className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconX className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            {error.includes('Too many requests') && (
              <p className="text-xs text-gray-500">
                Please wait a moment before trying again, or use the Retry button above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Availability Calendar - {vehicleName}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBookedDates(true)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Booked (Approved)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Booked (Completed)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Other Month</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Days */}
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate === day.date
              let bgColor = 'bg-white'
              let borderColor = 'border-gray-200'
              let textColor = 'text-gray-900'
              
              if (!day.isCurrentMonth) {
                bgColor = 'bg-gray-50'
                textColor = 'text-gray-400'
              } else if (day.isBooked) {
                if (day.bookingStatus === 'approved') {
                  bgColor = 'bg-red-50'
                  borderColor = 'border-red-200'
                  textColor = 'text-red-700'
                } else if (day.bookingStatus === 'completed') {
                  bgColor = 'bg-blue-50'
                  borderColor = 'border-blue-200'
                  textColor = 'text-blue-700'
                }
              } else if (day.isToday) {
                bgColor = 'bg-green-50'
                borderColor = 'border-green-300'
                textColor = 'text-green-700'
              }
              
              if (isSelected) {
                bgColor = 'bg-blue-100'
                borderColor = 'border-blue-300'
                textColor = 'text-blue-700'
              }

              return (
                <div
                  key={index}
                  className={`
                    p-2 text-center text-sm border rounded cursor-pointer transition-colors
                    ${bgColor} ${borderColor} ${textColor}
                    ${day.isBooked ? 'cursor-not-allowed opacity-75' : 'hover:bg-gray-100'}
                    ${day.isToday ? 'font-bold' : ''}
                  `}
                  onClick={() => {
                    if (!day.isBooked) {
                      setSelectedDate(day.date)
                    }
                  }}
                  title={
                    day.isBooked 
                      ? `Booked (${day.bookingStatus})` 
                      : day.isToday 
                        ? 'Today' 
                        : 'Available'
                  }
                >
                  {day.day}
                  {day.isBooked && (
                    <div className="flex justify-center mt-1">
                      {day.bookingStatus === 'approved' ? (
                        <IconX className="h-3 w-3 text-red-500" />
                      ) : (
                        <IconCheck className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This date is available for booking
              </p>
            </div>
          )}

          {/* Booking Summary */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">Total Booked Days:</span>
                <span className="ml-2 font-medium">{bookedDates.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Month:</span>
                <span className="ml-2 font-medium">{monthNames[currentMonth]} {currentYear}</span>
              </div>
            </div>
            {bookedDates.length === 0 && !loading && (
              <div className="mt-2 text-xs text-green-600">
                ✅ No bookings found - vehicle is fully available this month
              </div>
            )}
            {bookedDates.length > 0 && (
              <div className="mt-2 text-xs text-blue-600">
                📅 {bookedDates.length} booking{bookedDates.length !== 1 ? 's' : ''} found for this vehicle
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
