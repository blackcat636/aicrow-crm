import { fetchWithAuth } from '../api';
import {
  BookingsApiResponse,
  BookingApiResponse,
  BookingQueryDto,
  BookingStatisticsApiResponse,
  BookingStatus
} from '@/interface/Booking';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function getAllBookings(
  query: BookingQueryDto = {}
): Promise<BookingsApiResponse> {
  try {
    const params = new URLSearchParams();

    if (query.status) {
      // Handle multiple status values if they are comma-separated
      const statuses = query.status.split(',').map((s) => s.trim());
      statuses.forEach((status) => {
        if (status) params.append('status', status);
      });
    }
    if (query.paymentStatus) {
      // Handle multiple payment status values if they are comma-separated
      const paymentStatuses = query.paymentStatus
        .split(',')
        .map((s) => s.trim());
      paymentStatuses.forEach((paymentStatus) => {
        if (paymentStatus) params.append('paymentStatus', paymentStatus);
      });
    }
    if (query.search) params.append('search', query.search);
    // Date filtering removed - API doesn't support it
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const url = `${API_URL}/admin/bookings?${params.toString()}`;
    console.log('🔍 Fetching bookings from:', url);

    const response = await fetchWithAuth(url);

    console.log(
      '📡 Bookings API Response status:',
      response.status,
      response.statusText
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as BookingsApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error('Failed to fetch bookings');
    }
  } catch (error) {
    console.error('❌ API: Error in getAllBookings:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to fetch bookings';
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage =
          'Network error: Unable to connect to the server. Please check if the API server is running.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error: Please log in again.';
      } else if (error.message.includes('403')) {
        errorMessage =
          'Access denied: You do not have permission to access this resource.';
      } else if (error.message.includes('404')) {
        errorMessage =
          'API endpoint not found. Please check the server configuration.';
      } else if (error.message.includes('500')) {
        errorMessage =
          'Server error: The API server encountered an internal error.';
      } else {
        errorMessage = error.message;
      }
    }

    throw new Error(errorMessage);
  }
}

export async function getBookingStatistics(): Promise<BookingStatisticsApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/statistics`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch booking statistics');
    }
    const data = (await response.json()) as BookingStatisticsApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error('Failed to fetch booking statistics');
    }
  } catch (error) {
    console.error('❌ API: Error in getBookingStatistics:', error);
    return {
      status: 0,
      data: {
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        completedPayments: 0,
        averageBookingValue: 0,
        monthlyBookings: 0,
        weeklyBookings: 0,
        dailyBookings: 0
      }
    };
  }
}

export async function getBookingById(id: number): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/bookings/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch booking with id ${id}`);
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || `Failed to fetch booking with id ${id}`);
    }
  } catch (error) {
    console.error('❌ API: Error in getBookingById:', error);
    return defaultErrorResponse;
  }
}

export async function updateBookingStatus(
  id: number,
  status: BookingStatus
): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update booking status');
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update booking status');
    }
  } catch (error) {
    console.error('❌ API: Error in updateBookingStatus:', error);
    return defaultErrorResponse;
  }
}

export async function approveBooking(id: number): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to approve booking');
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to approve booking');
    }
  } catch (error) {
    console.error('❌ API: Error in approveBooking:', error);
    return defaultErrorResponse;
  }
}

export async function rejectBooking(id: number): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reject booking');
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to reject booking');
    }
  } catch (error) {
    console.error('❌ API: Error in rejectBooking:', error);
    return defaultErrorResponse;
  }
}

export async function cancelBooking(id: number): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to cancel booking');
    }
  } catch (error) {
    console.error('❌ API: Error in cancelBooking:', error);
    return defaultErrorResponse;
  }
}

export async function confirmCashPayment(id: number): Promise<{
  status: number;
  data: {
    bookingId: number;
    paymentStatus: 'PAID';
    message: string;
  };
}> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/payment/confirm-cash`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to confirm cash payment');
    }
    const data = await response.json();

    if (data.status === 200) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to confirm cash payment');
    }
  } catch (error) {
    console.error('❌ API: Error in confirmCashPayment:', error);
    return {
      status: 0,
      data: {
        bookingId: 0,
        paymentStatus: 'PAID',
        message: 'Network error'
      }
    };
  }
}

export async function rejectCashPayment(id: number): Promise<{
  status: number;
  data: {
    bookingId: number;
    paymentStatus: 'PENDING';
    message: string;
  };
}> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/payment/reject-cash`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reject cash payment');
    }
    const data = await response.json();

    if (data.status === 200) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to reject cash payment');
    }
  } catch (error) {
    console.error('❌ API: Error in rejectCashPayment:', error);
    return {
      status: 0,
      data: {
        bookingId: 0,
        paymentStatus: 'PENDING',
        message: 'Network error'
      }
    };
  }
}

export async function completeBooking(id: number): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to complete booking');
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to complete booking');
    }
  } catch (error) {
    console.error('❌ API: Error in completeBooking:', error);
    return defaultErrorResponse;
  }
}

export async function releasePayment(id: number): Promise<BookingApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/bookings/${id}/release-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to release payment');
    }
    const data = (await response.json()) as BookingApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to release payment');
    }
  } catch (error) {
    console.error('❌ API: Error in releasePayment:', error);
    return defaultErrorResponse;
  }
}

// Get booked dates for a specific vehicle
export async function getVehicleBookedDates(vehicleId: number): Promise<{
  status: 'success' | 'error';
  data?: { startDate: string; endDate: string; status: string }[];
  error?: string;
}> {
  try {
    // Get all bookings and filter by vehicle ID on client side
    // Use separate status parameters as the API expects individual values
    // Note: API expects lowercase status values
    const params = new URLSearchParams();
    params.append('status', 'approved');
    params.append('status', 'completed');

    const url = `${API_URL}/admin/bookings?${params.toString()}`;
    console.log(
      '🔍 Fetching booked dates for vehicle:',
      vehicleId,
      'from API:',
      url
    );

    const response = await fetchWithAuth(url, {
      method: 'GET'
    });

    console.log(
      '📡 API Response status:',
      response.status,
      response.statusText
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          'Too many requests. Please wait a moment and try again.'
        );
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('🔍 API Response for vehicle bookings:', result);

    if ((result.status === 200 || result.status === 0) && result.data) {
      console.log('📊 All bookings data:', result.data);

      // Filter bookings by vehicle ID and transform to date ranges
      const vehicleBookings = result.data.filter(
        (booking: { vehicle?: { id: number } }) => {
          console.log(
            '🚗 Checking booking vehicle ID:',
            booking.vehicle?.id,
            'vs target:',
            vehicleId
          );
          return booking.vehicle && booking.vehicle.id === vehicleId;
        }
      );

      console.log('🎯 Filtered vehicle bookings:', vehicleBookings);

      const bookedDates = vehicleBookings.map(
        (booking: {
          startDateTime: number;
          endDateTime: number;
          status: string;
        }) => ({
          startDate: new Date(booking.startDateTime)
            .toISOString()
            .split('T')[0],
          endDate: new Date(booking.endDateTime).toISOString().split('T')[0],
          status: booking.status
        })
      );

      console.log('📅 Transformed booked dates:', bookedDates);

      return {
        status: 'success',
        data: bookedDates
      };
    }

    console.log('❌ No data received or invalid status:', result);
    return {
      status: 'error',
      error: 'No data received or invalid API response'
    };
  } catch (error) {
    console.error('❌ Error fetching vehicle booked dates:', error);

    // Provide more specific error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage =
          'Network error: Unable to connect to the server. Please check if the API server is running.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error: Please log in again.';
      } else if (error.message.includes('403')) {
        errorMessage =
          'Access denied: You do not have permission to access this resource.';
      } else if (error.message.includes('404')) {
        errorMessage =
          'API endpoint not found. Please check the server configuration.';
      } else if (error.message.includes('500')) {
        errorMessage =
          'Server error: The API server encountered an internal error.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      status: 'error',
      error: errorMessage
    };
  }
}

const defaultErrorResponse: BookingApiResponse = {
  status: 0,
  message: 'Network error',
  data: {
    id: 0,
    vehicle: {
      id: 0,
      name: '',
      brandId: 0,
      modelId: 0,
      colorId: 0,
      year: 0,
      category: '',
      price: null,
      rentalPrice: '0',
      rentalMinPeriod: null,
      rentalMaxPeriod: null,
      rating: '0',
      transmission: '',
      fuel: '',
      seats: 0,
      available: false,
      description: '',
      country: null,
      city: null,
      latitude: null,
      longitude: null,
      address: null,
      status: '',
      createdAt: '',
      updatedAt: ''
    },
    user: {
      id: 0,
      uuid: '',
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      phone: null,
      photo: null,
      dateOfBirth: null,
      role: '',
      balance: '0',
      frozenBalance: '0',
      isEmailVerified: false,
      referralCode: null,
      referredByCode: null,
      createdAt: '',
      updatedAt: ''
    },
    startDateTime: 0,
    endDateTime: 0,
    totalPrice: '0',
    basePrice: '0',
    pricePerDay: '0',
    rentalDays: 0,
    optionsPrice: '0',
    systemFee: '0',
    depositAmount: '0',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: undefined,
    paymentIntentId: undefined,
    paymentReleaseDate: undefined,
    paymentAwaitingConfirmation: false,
    createdAt: '',
    updatedAt: '',
    notes: '',
    pickupLocation: '',
    returnLocation: '',
    insurance: false,
    additionalServices: []
  }
};
