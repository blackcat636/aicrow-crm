"use client"
export const runtime = 'edge';
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getBookingById } from '@/lib/api/bookings'
import { useBookingsStore } from '@/store/useBookingsStore'
import { BookingDetail } from '@/interface/Booking'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  IconCalendar, 
  IconCar, 
  IconUser, 
  IconCreditCard, 
  IconClock,
  IconMapPin,
  IconNotes,
  IconShield,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconCash,
  IconThumbUp,
  IconThumbDown
} from '@tabler/icons-react'
import Link from 'next/link'

export default function BookingDetailPage() {
  const params = useParams()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { 
    approveBooking, 
    rejectBooking, 
    cancelBooking, 
    completeBooking,
    confirmCashPayment, 
    rejectCashPayment,
    isLoading: isActionLoading 
  } = useBookingsStore()

  useEffect(() => {
    const fetchBooking = async () => {
      if (!params.id) return
      
      setIsLoading(true)
      try {
        const response = await getBookingById(Number(params.id))
        if (response.status === 200 || response.status === 0) {
          setBooking(response.data)
        } else {
          setError(response.message || 'Error loading booking')
        }
      } catch (error) {
        console.error('Error fetching booking:', error)
        setError('Error loading booking')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [params.id])

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending Payment</Badge>
      case 'frozen':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Frozen</Badge>
      case 'released':
        return <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600">Released</Badge>
      case 'refunded':
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApprove = async () => {
    if (!booking) return
    try {
      await approveBooking(booking.id)
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Error approving booking:', error)
    }
  }

  const handleReject = async () => {
    if (!booking) return
    try {
      await rejectBooking(booking.id)
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Error rejecting booking:', error)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    try {
      await cancelBooking(booking.id)
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }


  const handleComplete = async () => {
    if (!booking) return
    try {
      await completeBooking(booking.id)
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Error completing booking:', error)
    }
  }

  const handleConfirmCashPayment = async () => {
    if (!booking) return
    try {
      await confirmCashPayment(booking.id)
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Error confirming cash payment:', error)
    }
  }

  const handleRejectCashPayment = async () => {
    if (!booking) return
    try {
      await rejectCashPayment(booking.id)
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Error rejecting cash payment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-muted-foreground">{error || 'Booking not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bookings">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
            <p className="text-muted-foreground">
              Detailed booking information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {getStatusBadge(booking.status)}
            {getPaymentStatusBadge(booking.paymentStatus)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{booking.user?.firstName} {booking.user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{booking.user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{booking.user?.phone || 'Not specified'}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">Actions</p>
              <div className="flex gap-2 flex-wrap">
                {/* Booking Status Actions */}
                {(booking.status as string).toUpperCase() === 'PENDING' && (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={isActionLoading}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <IconCheck className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isActionLoading}
                      variant="destructive"
                      size="sm"
                    >
                      <IconX className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                
                {((booking.status as string).toUpperCase() === 'PENDING' || (booking.status as string).toUpperCase() === 'APPROVED') && (
                  <Button
                    onClick={handleCancel}
                    disabled={isActionLoading}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    <IconX className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                
                {(booking.status as string).toUpperCase() === 'APPROVED' && (
                  <Button
                    onClick={handleComplete}
                    disabled={isActionLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <IconCheck className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCar className="h-5 w-5" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{booking.vehicle?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Year</p>
              <p className="text-lg">{booking.vehicle?.year}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-lg">{booking.vehicle?.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transmission</p>
              <p className="text-lg">{booking.vehicle?.transmission}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fuel</p>
              <p className="text-lg">{booking.vehicle?.fuel}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seats</p>
              <p className="text-lg">{booking.vehicle?.seats}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price per day</p>
              <p className="text-lg font-mono">{booking.vehicle?.rentalPrice ? parseFloat(booking.vehicle.rentalPrice).toLocaleString('uk-UA') : '0'} CAD</p>
            </div>
          </CardContent>
        </Card>

        {/* Dates and Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              Booking Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start</p>
              <p className="text-lg">
                {new Date(typeof booking.startDateTime === 'string' ? booking.startDateTime : booking.startDateTime).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">End</p>
              <p className="text-lg">
                {new Date(typeof booking.endDateTime === 'string' ? booking.endDateTime : booking.endDateTime).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-lg">
                {Math.ceil((booking.endDateTime - booking.startDateTime) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total rental cost</p>
              <p className="text-2xl font-bold text-green-600">
                {parseFloat(typeof booking.totalPrice === 'string' ? booking.totalPrice : booking.totalPrice.toString()).toLocaleString('uk-UA')} CAD
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deposit amount</p>
              <p className="text-lg font-mono">
                {parseFloat(typeof booking.depositAmount === 'string' ? booking.depositAmount : booking.depositAmount.toString()).toLocaleString('uk-UA')} CAD
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment method</p>
              <p className="text-lg">{booking.paymentMethod || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment status</p>
              <div className="mt-2">
                {getPaymentStatusBadge(booking.paymentStatus)}
              </div>
            </div>
            {(booking.paymentMethod as string)?.toUpperCase() === 'CASH' && booking.paymentAwaitingConfirmation && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <IconCash className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">Cash Payment Awaiting Confirmation</p>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  This booking requires manual confirmation of cash payment.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmCashPayment}
                    disabled={isActionLoading}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <IconThumbUp className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </Button>
                  <Button
                    onClick={handleRejectCashPayment}
                    disabled={isActionLoading}
                    variant="destructive"
                    size="sm"
                  >
                    <IconThumbDown className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                </div>
              </div>
            )}
            {booking.paymentIntentId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                <p className="text-lg font-mono">{booking.paymentIntentId}</p>
              </div>
            )}
            {booking.paymentReleaseDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refund date</p>
                <p className="text-lg">
                  {new Date(booking.paymentReleaseDate).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Additional Information */}
        {(booking.pickupLocation || booking.returnLocation || booking.notes || booking.insurance) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconNotes className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.pickupLocation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IconMapPin className="h-4 w-4" />
                    Pickup location
                  </p>
                  <p className="text-lg">{booking.pickupLocation}</p>
                </div>
              )}
              {booking.returnLocation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IconMapPin className="h-4 w-4" />
                    Return location
                  </p>
                  <p className="text-lg">{booking.returnLocation}</p>
                </div>
              )}
              {booking.insurance && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IconShield className="h-4 w-4" />
                    Insurance
                  </p>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Included
                  </Badge>
                </div>
              )}
              {booking.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-lg">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-lg">
                  {new Date(booking.createdAt).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updated</p>
                <p className="text-lg">
                  {new Date(booking.updatedAt).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
