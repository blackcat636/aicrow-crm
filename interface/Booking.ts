// Booking statuses according to API
export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'converted_to_long_term';
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'frozen'
  | 'released'
  | 'refunded';
export type PaymentMethod = 'CASH' | 'STRIPE';

export interface VehicleResponseDto {
  id: number;
  name: string;
  brandId: number;
  modelId: number;
  colorId: number;
  year: number;
  category: string;
  price: number | null;
  rentalPrice: string;
  rentalMinPeriod: number | null;
  rentalMaxPeriod: number | null;
  rating: string;
  transmission: string;
  fuel: string;
  seats: number;
  available: boolean;
  description: string;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponseDto {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  photo: string | null;
  dateOfBirth: string | null;
  role: string;
  balance: string;
  frozenBalance: string;
  isEmailVerified: boolean;
  referralCode: string | null;
  referredByCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingOptionResponseDto {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  pricingType: 'fixed_per_day' | 'percentage';
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  startDateTime: number; // Unix timestamp
  endDateTime: number; // Unix timestamp
  totalPrice: number | string;
  basePrice: number | string;
  pricePerDay: number | string;
  rentalDays: number | string;
  optionsPrice: number | string;
  systemFee: number | string;
  depositAmount: number | string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paymentReleaseDate?: Date | string;
  invoiceId?: string;
  paymentMethod?: PaymentMethod;
  paymentAwaitingConfirmation?: boolean;
  vehicle?: VehicleResponseDto;
  user?: UserResponseDto;
  bookingOptions?: BookingOptionResponseDto[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BookingDetail extends Booking {
  // Additional details for detail page
  notes?: string;
  pickupLocation?: string;
  returnLocation?: string;
  insurance?: boolean;
  additionalServices?: string[];
}

// Query DTOs
export interface BookingQueryDto {
  status?: string; // API expects lowercase status values
  paymentStatus?: string; // API expects lowercase payment status values
  search?: string;
  startDate?: string; // Date range start (ISO string)
  endDate?: string; // Date range end (ISO string)
  page?: number;
  limit?: number;
}

// Statistics DTO
export interface BookingStatisticsDto {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  averageBookingValue: number;
  monthlyBookings: number;
  weeklyBookings: number;
  dailyBookings: number;
}

export interface BookingsApiResponse {
  status: number;
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingApiResponse {
  status: number;
  message: string;
  data: BookingDetail;
}

export interface BookingStatisticsApiResponse {
  status: number;
  data: BookingStatisticsDto;
}
