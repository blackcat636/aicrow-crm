import { create } from 'zustand';
import {
  BookingOptionType,
  CreateBookingOptionTypeDto,
  UpdateBookingOptionTypeDto
} from '@/interface/BookingOptionType';
import { bookingOptionTypesApi } from '@/lib/api/booking-option-types-api';

interface BookingOptionTypesState {
  optionTypes: BookingOptionType[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchOptionTypes: () => Promise<void>;
  createOptionType: (data: CreateBookingOptionTypeDto) => Promise<void>;
  updateOptionType: (
    id: number,
    data: UpdateBookingOptionTypeDto
  ) => Promise<void>;
  deleteOptionType: (id: number) => Promise<void>;
  getOptionTypeById: (id: number) => BookingOptionType | undefined;
  getOptionTypesWithVariants: () => Promise<BookingOptionType[]>;
}

export const useBookingOptionTypesStore = create<BookingOptionTypesState>(
  (set, get) => ({
    optionTypes: [],
    loading: false,
    error: null,

    fetchOptionTypes: async () => {
      set({ loading: true, error: null });
      try {
        const data = await bookingOptionTypesApi.getAll();
        set({ optionTypes: data, loading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка завантаження типів опцій',
          loading: false
        });
      }
    },

    createOptionType: async (data: CreateBookingOptionTypeDto) => {
      set({ loading: true, error: null });
      try {
        const newOptionType = await bookingOptionTypesApi.create(data);
        set((state) => ({
          optionTypes: [...state.optionTypes, newOptionType],
          loading: false
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка створення типу опції',
          loading: false
        });
        throw error;
      }
    },

    updateOptionType: async (id: number, data: UpdateBookingOptionTypeDto) => {
      set({ loading: true, error: null });
      try {
        const updatedOptionType = await bookingOptionTypesApi.update(id, data);
        set((state) => ({
          optionTypes: state.optionTypes.map((ot) =>
            ot.id === id ? updatedOptionType : ot
          ),
          loading: false
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка оновлення типу опції',
          loading: false
        });
        throw error;
      }
    },

    deleteOptionType: async (id: number) => {
      set({ loading: true, error: null });
      try {
        await bookingOptionTypesApi.delete(id);
        set((state) => ({
          optionTypes: state.optionTypes.filter((ot) => ot.id !== id),
          loading: false
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка видалення типу опції',
          loading: false
        });
        throw error;
      }
    },

    getOptionTypeById: (id: number) => {
      return get().optionTypes.find((ot) => ot.id === id);
    },

    getOptionTypesWithVariants: async () => {
      set({ loading: true, error: null });
      try {
        const data = await bookingOptionTypesApi.getAllWithVariants();
        set({ optionTypes: data, loading: false });
        return data;
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка завантаження типів опцій з варіантами',
          loading: false
        });
        throw error;
      }
    }
  })
);
