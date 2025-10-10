import { create } from 'zustand';
import {
  getAllBookings,
  getBookingStatistics,
  updateBookingStatus,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  confirmCashPayment,
  rejectCashPayment,
  releasePayment
} from '@/lib/api/bookings';
import {
  Booking,
  BookingQueryDto,
  BookingStatisticsDto,
  BookingStatus,
  PaymentStatus
} from '@/interface/Booking';

interface BookingsStore {
  bookings: Booking[];
  allBookings: Booking[]; // Store all bookings for client-side filtering
  statistics: BookingStatisticsDto | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  currentQuery: BookingQueryDto;
  fetchBookings: (query?: BookingQueryDto) => Promise<void>;
  fetchAllBookings: () => Promise<void>; // Fetch all bookings for filtering
  fetchStatistics: () => Promise<void>;
  updateBookingInStore: (updatedBooking: Booking) => void;
  updateBookingStatus: (id: number, status: BookingStatus) => Promise<void>;
  approveBooking: (id: number) => Promise<void>;
  rejectBooking: (id: number) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
  completeBooking: (id: number) => Promise<void>;
  confirmCashPayment: (id: number) => Promise<void>;
  rejectCashPayment: (id: number) => Promise<void>;
  releasePayment: (id: number) => Promise<void>;
  setQuery: (query: Partial<BookingQueryDto>) => void;
  clearQuery: () => void;
  filterBookings: (query: BookingQueryDto) => void; // Client-side filtering
}

export const useBookingsStore = create<BookingsStore>((set, get) => ({
  bookings: [],
  allBookings: [], // Store all bookings for client-side filtering
  statistics: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  currentQuery: {},

  fetchBookings: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const currentQuery = get().currentQuery;
      const mergedQuery = { ...currentQuery, ...query };

      const response = await getAllBookings(mergedQuery);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          bookings: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit,
          currentQuery: mergedQuery
        });
      } else {
        set({ error: 'Error loading bookings' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchBookings:', error);
      set({ error: 'Error loading bookings' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all bookings without pagination for client-side filtering
      const response = await getAllBookings({ page: 1, limit: 1000 });

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          allBookings: response.data,
          total: response.data.length
        });
      } else {
        set({ error: 'Error loading all bookings' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchAllBookings:', error);
      set({ error: 'Error loading all bookings' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getBookingStatistics();

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({ statistics: response.data });
      } else {
        set({ error: 'Error loading statistics' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchStatistics:', error);
      set({ error: 'Error loading statistics' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBookingInStore: (updatedBooking: Booking) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    }));
  },

  updateBookingStatus: async (id: number, status: BookingStatus) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateBookingStatus(id, status);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateBookingInStore(response.data);
      } else {
        console.error('Store: API error response:', response);
        set({
          error: 'Error updating booking status'
        });
      }
    } catch (error) {
      console.error('❌ Store: Error in updateBookingStatus:', error);
      set({ error: 'Error updating booking status' });
    } finally {
      set({ isLoading: false });
    }
  },

  approveBooking: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await approveBooking(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateBookingInStore(response.data);
      } else {
        set({ error: 'Error approving booking' });
      }
    } catch (error) {
      console.error('❌ Store: Error in approveBooking:', error);
      set({ error: 'Error approving booking' });
    } finally {
      set({ isLoading: false });
    }
  },

  rejectBooking: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await rejectBooking(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateBookingInStore(response.data);
      } else {
        set({ error: 'Error rejecting booking' });
      }
    } catch (error) {
      console.error('❌ Store: Error in rejectBooking:', error);
      set({ error: 'Error rejecting booking' });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelBooking: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cancelBooking(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateBookingInStore(response.data);
      } else {
        set({ error: 'Error cancelling booking' });
      }
    } catch (error) {
      console.error('❌ Store: Error in cancelBooking:', error);
      set({ error: 'Error cancelling booking' });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmCashPayment: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await confirmCashPayment(id);

      if (response.status === 200) {
        // Refresh bookings to get updated data
        await get().fetchBookings({ page: get().page, limit: get().limit });
      } else {
        set({ error: 'Error confirming cash payment' });
      }
    } catch (error) {
      console.error('❌ Store: Error in confirmCashPayment:', error);
      set({ error: 'Error confirming cash payment' });
    } finally {
      set({ isLoading: false });
    }
  },

  rejectCashPayment: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await rejectCashPayment(id);

      if (response.status === 200) {
        // Refresh bookings to get updated data
        await get().fetchBookings(get().currentQuery);
      } else {
        set({ error: 'Error rejecting cash payment' });
      }
    } catch (error) {
      console.error('❌ Store: Error in rejectCashPayment:', error);
      set({ error: 'Error rejecting cash payment' });
    } finally {
      set({ isLoading: false });
    }
  },

  completeBooking: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await completeBooking(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateBookingInStore(response.data);
      } else {
        set({ error: 'Error completing booking' });
      }
    } catch (error) {
      console.error('❌ Store: Error in completeBooking:', error);
      set({ error: 'Error completing booking' });
    } finally {
      set({ isLoading: false });
    }
  },

  releasePayment: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await releasePayment(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateBookingInStore(response.data);
      } else {
        set({ error: 'Error releasing payment' });
      }
    } catch (error) {
      console.error('❌ Store: Error in releasePayment:', error);
      set({ error: 'Error releasing payment' });
    } finally {
      set({ isLoading: false });
    }
  },

  setQuery: (query: Partial<BookingQueryDto>) => {
    set((state) => ({
      currentQuery: { ...state.currentQuery, ...query }
    }));
  },

  clearQuery: () => {
    set({ currentQuery: {} });
  },

  filterBookings: (query: BookingQueryDto) => {
    const { allBookings } = get();
    let filteredBookings = [...allBookings];

    // Filter by search term (vehicle name, user name, email)
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredBookings = filteredBookings.filter((booking) => {
        const vehicleName = booking.vehicle?.name?.toLowerCase() || '';
        const userName = `${booking.user?.firstName || ''} ${
          booking.user?.lastName || ''
        }`.toLowerCase();
        const userEmail = booking.user?.email?.toLowerCase() || '';
        const username = booking.user?.username?.toLowerCase() || '';

        return (
          vehicleName.includes(searchTerm) ||
          userName.includes(searchTerm) ||
          userEmail.includes(searchTerm) ||
          username.includes(searchTerm)
        );
      });
    }

    // Filter by booking status
    if (query.status) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === query.status
      );
    }

    // Filter by payment status
    if (query.paymentStatus) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.paymentStatus === query.paymentStatus
      );
    }

    // Filter by date range - find bookings that are within the date range
    if (query.startDate || query.endDate) {
      filteredBookings = filteredBookings.filter((booking) => {
        // Check if timestamp is already in milliseconds or seconds
        const startTimestamp =
          booking.startDateTime > 1000000000000
            ? booking.startDateTime
            : booking.startDateTime * 1000;
        const endTimestamp =
          booking.endDateTime > 1000000000000
            ? booking.endDateTime
            : booking.endDateTime * 1000;

        const bookingStartDate = new Date(startTimestamp);
        const bookingEndDate = new Date(endTimestamp);

        // If only start date is provided, find bookings that end on or after this date
        if (query.startDate && !query.endDate) {
          const filterStartDate = new Date(query.startDate);
          filterStartDate.setHours(0, 0, 0, 0); // Start of day
          return bookingEndDate >= filterStartDate;
        }

        // If only end date is provided, find bookings that start on or before this date
        if (!query.startDate && query.endDate) {
          const filterEndDate = new Date(query.endDate);
          filterEndDate.setHours(23, 59, 59, 999); // End of day
          return bookingStartDate <= filterEndDate;
        }

        // If both dates are provided, find bookings that are within the range
        if (query.startDate && query.endDate) {
          const filterStartDate = new Date(query.startDate);
          const filterEndDate = new Date(query.endDate);

          // Set time to start and end of day for proper comparison
          filterStartDate.setHours(0, 0, 0, 0);
          filterEndDate.setHours(23, 59, 59, 999);

          // Booking is within filter range if:
          // - booking starts on or after filter start date AND
          // - booking ends on or before filter end date
          return (
            bookingStartDate >= filterStartDate &&
            bookingEndDate <= filterEndDate
          );
        }

        return true;
      });
    }

    // Apply pagination
    const startIndex = ((query.page || 1) - 1) * (query.limit || 10);
    const endIndex = startIndex + (query.limit || 10);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    set({
      bookings: paginatedBookings,
      total: filteredBookings.length,
      page: query.page || 1,
      limit: query.limit || 10,
      currentQuery: query
    });
  }
}));
