"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  IconCalendar, 
  IconCar, 
  IconUser, 
  IconCurrencyDollar, 
  IconCreditCard,
  IconClock,
  IconMapPin,
  IconSettings
} from "@tabler/icons-react"
import { Booking } from "@/interface/Booking"

interface BookingDetailsModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  if (!booking) return null

  const formatCurrency = (amount: number | string | undefined | null) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0)
    return `CAD ${(isNaN(numAmount) ? 0 : numAmount).toFixed(2)}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
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
    switch (status) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Booking Details #{booking.id}
          </DialogTitle>
          <DialogDescription>
            Complete information about this car rental booking
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking Status</label>
                  <div className="mt-1">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                  <div className="mt-1">
                    {getPaymentStatusBadge(booking.paymentStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.user ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{booking.user.firstName} {booking.user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{booking.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{booking.user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="text-sm capitalize">{booking.user.role}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Customer information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCar className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.vehicle ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vehicle Name</label>
                    <p className="text-sm font-medium">{booking.vehicle.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Year</label>
                    <p className="text-sm">{booking.vehicle.year}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transmission</label>
                    <p className="text-sm capitalize">{booking.vehicle.transmission}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fuel Type</label>
                    <p className="text-sm capitalize">{booking.vehicle.fuel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Seats</label>
                    <p className="text-sm">{booking.vehicle.seats}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm capitalize">{booking.vehicle.category}</p>
                  </div>
                  {booking.vehicle.address && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <IconMapPin className="h-4 w-4" />
                        Location
                      </label>
                      <p className="text-sm">{booking.vehicle.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Vehicle information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Rental Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="h-5 w-5" />
                Rental Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-sm">{formatDate(booking.startDateTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="text-sm">{formatDate(booking.endDateTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-sm">
                    {typeof booking.rentalDays === 'string' ? parseInt(booking.rentalDays) : booking.rentalDays} days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price per Day</label>
                  <p className="text-sm">{formatCurrency(booking.pricePerDay)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCurrencyDollar className="h-5 w-5" />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Base Price ({booking.rentalDays} days)</span>
                  <span className="text-sm font-medium">{formatCurrency(booking.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Options Price</span>
                  <span className="text-sm font-medium">{formatCurrency(booking.optionsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">System Fee (5%)</span>
                  <span className="text-sm font-medium">{formatCurrency(booking.systemFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Deposit</span>
                  <span className="text-sm font-medium">{formatCurrency(booking.depositAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Price</span>
                  <span>{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm">{booking.paymentMethod || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Intent ID</label>
                  <p className="text-xs font-mono">{booking.paymentIntentId || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice ID</label>
                  <p className="text-xs font-mono">{booking.invoiceId || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Awaiting Confirmation</label>
                  <p className="text-sm">
                    {booking.paymentAwaitingConfirmation ? 'Yes' : 'No'}
                  </p>
                </div>
                {booking.paymentReleaseDate && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Payment Release Date</label>
                    <p className="text-sm">
                      {typeof booking.paymentReleaseDate === 'string' 
                        ? new Date(booking.paymentReleaseDate).toLocaleDateString('uk-UA')
                        : formatDate(booking.paymentReleaseDate.getTime())
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Options */}
          {booking.bookingOptions && booking.bookingOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconSettings className="h-5 w-5" />
                  Selected Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {booking.bookingOptions.map((option) => (
                    <div key={option.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{option.displayName}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {option.pricingType === 'fixed_per_day' 
                            ? `${formatCurrency(option.price)}/day`
                            : `${option.price}%`
                          }
                        </p>
                        <Badge variant={option.isRequired ? "destructive" : "outline"} className="text-xs">
                          {option.isRequired ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">
                    {typeof booking.createdAt === 'string' 
                      ? new Date(booking.createdAt).toLocaleDateString('uk-UA')
                      : formatDate(booking.createdAt.getTime())
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                  <p className="text-sm">
                    {typeof booking.updatedAt === 'string' 
                      ? new Date(booking.updatedAt).toLocaleDateString('uk-UA')
                      : formatDate(booking.updatedAt.getTime())
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
