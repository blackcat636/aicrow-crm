import { create } from 'zustand';
import {
  BookingOptionVariant,
  CreateBookingOptionVariantDto,
  UpdateBookingOptionVariantDto
} from '@/interface/BookingOptionType';
import { bookingOptionVariantsApi } from '@/lib/api/booking-option-variants-api';

interface BookingOptionVariantsState {
  variants: BookingOptionVariant[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchVariants: (optionTypeId: number) => Promise<void>;
  createVariant: (data: CreateBookingOptionVariantDto) => Promise<void>;
  updateVariant: (
    id: number,
    data: UpdateBookingOptionVariantDto
  ) => Promise<void>;
  deleteVariant: (id: number) => Promise<void>;
  getVariantById: (id: number) => BookingOptionVariant | undefined;
  getVariantsByOptionType: (optionTypeId: number) => BookingOptionVariant[];
  clearVariants: () => void;
}

export const useBookingOptionVariantsStore = create<BookingOptionVariantsState>(
  (set, get) => ({
    variants: [],
    loading: false,
    error: null,

    fetchVariants: async (optionTypeId: number) => {
      set({ loading: true, error: null });
      try {
        const data = await bookingOptionVariantsApi.getByOptionType(
          optionTypeId
        );
        set({ variants: data, loading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка завантаження варіантів',
          loading: false
        });
      }
    },

    createVariant: async (data: CreateBookingOptionVariantDto) => {
      set({ loading: true, error: null });
      try {
        const newVariant = await bookingOptionVariantsApi.create(data);
        set((state) => ({
          variants: [...state.variants, newVariant],
          loading: false
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка створення варіанту',
          loading: false
        });
        throw error;
      }
    },

    updateVariant: async (id: number, data: UpdateBookingOptionVariantDto) => {
      set({ loading: true, error: null });
      try {
        const updatedVariant = await bookingOptionVariantsApi.update(id, data);
        set((state) => ({
          variants: state.variants.map((v) =>
            v.id === id ? updatedVariant : v
          ),
          loading: false
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка оновлення варіанту',
          loading: false
        });
        throw error;
      }
    },

    deleteVariant: async (id: number) => {
      set({ loading: true, error: null });
      try {
        await bookingOptionVariantsApi.delete(id);
        set((state) => ({
          variants: state.variants.filter((v) => v.id !== id),
          loading: false
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Помилка видалення варіанту',
          loading: false
        });
        throw error;
      }
    },

    getVariantById: (id: number) => {
      return get().variants.find((v) => v.id === id);
    },

    getVariantsByOptionType: (optionTypeId: number) => {
      return get().variants.filter((v) => v.optionTypeId === optionTypeId);
    },

    clearVariants: () => {
      set({ variants: [], error: null });
    }
  })
);
