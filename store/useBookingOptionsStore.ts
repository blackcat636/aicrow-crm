import { create } from 'zustand';
import {
  BookingOptionType,
  BookingOptionVariant
} from '@/interface/BookingOption';
import {
  bookingOptionsApi,
  bookingOptionVariantsApi
} from '@/lib/api/booking-options';

interface BookingOptionsStore {
  bookingOptions: BookingOptionType[];
  isLoading: boolean;
  error: string | null;
  fetchBookingOptions: () => Promise<void>;
  createBookingOption: (
    data: Omit<BookingOptionType, 'id' | 'createdAt' | 'updatedAt'> & {
      variants?: BookingOptionVariant[];
    }
  ) => Promise<void>;
  updateBookingOption: (
    id: string,
    data: Partial<BookingOptionType> & { variants?: BookingOptionVariant[] },
    variants?: Omit<BookingOptionVariant, 'id'>[]
  ) => Promise<void>;
  deleteBookingOption: (id: string) => Promise<void>;
  bulkUpdateBookingOptions: (
    updates: Array<{ id: number; data: Partial<BookingOptionType> }>
  ) => Promise<void>;
  bulkDeleteBookingOptions: (ids: number[]) => Promise<void>;
  toggleBookingOptionStatus: (id: string) => Promise<void>;
}

export const useBookingOptionsStore = create<BookingOptionsStore>((set) => ({
  bookingOptions: [],
  isLoading: false,
  error: null,

  fetchBookingOptions: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await bookingOptionsApi.getAll();
      set({ bookingOptions: data });
    } catch (_error) {
      void _error;
      set({ error: 'Failed to fetch booking options' });
    } finally {
      set({ isLoading: false });
    }
  },

  createBookingOption: async (data) => {
    try {
      set({ isLoading: true, error: null });

      // Remove variants from data before creating booking option
      const { variants: _variants, ...bookingOptionData } = data;
      void _variants; // Suppress unused variable warning

      console.log('Creating booking option with data:', bookingOptionData);

      const newBookingOption = await bookingOptionsApi.create(
        bookingOptionData
      );

      console.log('Created booking option:', newBookingOption);

      set((state) => ({
        bookingOptions: [...state.bookingOptions, newBookingOption]
      }));
    } catch (error) {
      console.error('Error creating booking option:', error);
      set({ error: 'Failed to create booking option' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBookingOption: async (id, data, variants) => {
    try {
      set({ isLoading: true, error: null });

      // Remove variants from data before updating booking option
      const { variants: _variants, ...bookingOptionData } = data;
      void _variants; // Suppress unused variable warning

      console.log('Store: Updating booking option with data:', {
        id,
        bookingOptionData
      });

      const updatedBookingOption = await bookingOptionsApi.update(
        id,
        bookingOptionData
      );

      // Handle variants if provided and hasVariants is true
      if (variants !== undefined && data.hasVariants) {
        console.log('Updating variants:', variants);

        // For existing variants, update them
        // For new variants (without id), create them
        const updatedVariants = await Promise.all(
          variants.map(async (variant) => {
            // Check if this is an existing variant (has id > 0) or a new one
            const variantWithId = variant as BookingOptionVariant;
            if (variantWithId.id && variantWithId.id > 0) {
              // Update existing variant
              return await bookingOptionVariantsApi.update(
                variantWithId.id,
                variantWithId
              );
            } else {
              // Create new variant
              return await bookingOptionVariantsApi.createForOptionType(
                id,
                variant
              );
            }
          })
        );

        (
          updatedBookingOption as BookingOptionType & {
            variants?: BookingOptionVariant[];
          }
        ).variants = updatedVariants;
        console.log('Updated variants:', updatedVariants);
      } else if (variants !== undefined && !data.hasVariants) {
        // If hasVariants is false, clear variants
        (
          updatedBookingOption as BookingOptionType & {
            variants?: BookingOptionVariant[];
          }
        ).variants = [];
      }

      set((state) => ({
        bookingOptions: state.bookingOptions.map((option) =>
          option.id.toString() === id ? updatedBookingOption : option
        )
      }));
    } catch (error) {
      console.error('Error updating booking option:', error);
      set({ error: 'Failed to update booking option' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBookingOption: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await bookingOptionsApi.delete(id);
      set((state) => ({
        bookingOptions: state.bookingOptions.filter(
          (option) => option.id.toString() !== id
        )
      }));
    } catch (_error) {
      void _error; // Suppress unused variable warning
      set({ error: 'Failed to delete booking option' });
    } finally {
      set({ isLoading: false });
    }
  },

  bulkUpdateBookingOptions: async (updates) => {
    try {
      set({ isLoading: true, error: null });
      await bookingOptionsApi.bulkUpdate(updates);

      // Refresh the list to get updated data
      await bookingOptionsApi.getAll().then((data) => {
        set({ bookingOptions: data });
      });
    } catch (error) {
      console.error('Error bulk updating booking options:', error);
      set({ error: 'Failed to bulk update booking options' });
    } finally {
      set({ isLoading: false });
    }
  },

  bulkDeleteBookingOptions: async (ids) => {
    try {
      set({ isLoading: true, error: null });
      await bookingOptionsApi.bulkDelete(ids);

      // Remove deleted items from local state
      set((state) => ({
        bookingOptions: state.bookingOptions.filter(
          (option) => !ids.includes(option.id)
        )
      }));
    } catch (error) {
      console.error('Error bulk deleting booking options:', error);
      set({ error: 'Failed to bulk delete booking options' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBookingOptionStatus: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await bookingOptionsApi.toggleStatus(id);

      // Toggle status in local state
      set((state) => ({
        bookingOptions: state.bookingOptions.map((option) =>
          option.id.toString() === id
            ? { ...option, isActive: !option.isActive }
            : option
        )
      }));
    } catch (error) {
      console.error('Error toggling booking option status:', error);
      set({ error: 'Failed to toggle booking option status' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
