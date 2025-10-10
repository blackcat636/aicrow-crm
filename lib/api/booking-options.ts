import {
  BookingOptionType,
  BookingOptionVariant
} from '@/interface/BookingOption';
import { fetchWithAuth } from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

export const bookingOptionsApi = {
  getAll: async (): Promise<BookingOptionType[]> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch booking option types');
      }

      const data = (await response.json()) as ApiResponse<BookingOptionType[]>;
      return data.data || [];
    } catch (error) {
      console.error('Error loading booking option types:', error);
      throw error;
    }
  },

  getById: async (
    id: string,
    includeVariants: boolean = false
  ): Promise<BookingOptionType> => {
    try {
      const url = includeVariants
        ? `${API_URL}/admin/booking-options/types/${id}?includeVariants=true`
        : `${API_URL}/admin/booking-options/types/${id}`;

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch booking option type with id ${id}`);
      }

      const data = (await response.json()) as ApiResponse<BookingOptionType>;
      return data.data!;
    } catch (error) {
      console.error('Error loading booking option type:', error);
      throw error;
    }
  },

  create: async (
    data: Omit<BookingOptionType, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BookingOptionType> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create booking option type');
      }

      const result = (await response.json()) as ApiResponse<BookingOptionType>;
      return result.data!;
    } catch (error) {
      console.error('Error creating booking option type:', error);
      throw error;
    }
  },

  update: async (
    id: string,
    data: Partial<BookingOptionType>
  ): Promise<BookingOptionType> => {
    try {
      console.log('Updating booking option type:', { id, data });

      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update failed with response:', errorData);
        throw new Error(
          `Failed to update booking option type with id ${id}: ${
            errorData.message || response.statusText
          }`
        );
      }

      const result = (await response.json()) as ApiResponse<BookingOptionType>;
      return result.data!;
    } catch (error) {
      console.error('Error updating booking option type:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/${id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete booking option type with id ${id}`);
      }
    } catch (error) {
      console.error('Error deleting booking option type:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkUpdate: async (
    updates: Array<{ id: number; data: Partial<BookingOptionType> }>
  ): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/bulk-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ updates })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to bulk update booking option types');
      }
    } catch (error) {
      console.error('Error bulk updating booking option types:', error);
      throw error;
    }
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/bulk-delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to bulk delete booking option types');
      }
    } catch (error) {
      console.error('Error bulk deleting booking option types:', error);
      throw error;
    }
  },

  toggleStatus: async (id: string): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/${id}/toggle-status`,
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to toggle status for booking option type with id ${id}`
        );
      }
    } catch (error) {
      console.error('Error toggling booking option type status:', error);
      throw error;
    }
  }
};

// Variants API functions
export const bookingOptionVariantsApi = {
  // Get variants for a specific option type
  getByOptionType: async (
    optionTypeId: string
  ): Promise<BookingOptionVariant[]> => {
    try {
      // Since the variants endpoint doesn't exist, we'll get the option with variants
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/${optionTypeId}?includeVariants=true`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch option type with variants ${optionTypeId}`
        );
      }

      const data = (await response.json()) as ApiResponse<
        BookingOptionType & { variants?: BookingOptionVariant[] }
      >;
      return data.data?.variants || [];
    } catch (error) {
      console.error('Error loading booking option variants:', error);
      throw error;
    }
  },

  // Create variant directly (new endpoint)
  create: async (
    variant: Omit<BookingOptionVariant, 'id'>
  ): Promise<BookingOptionVariant> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/variants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variant)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create booking option variant');
      }

      const result =
        (await response.json()) as ApiResponse<BookingOptionVariant>;
      return result.data!;
    } catch (error) {
      console.error('Error creating booking option variant:', error);
      throw error;
    }
  },

  // Create variant for specific option type
  createForOptionType: async (
    bookingOptionId: string,
    variant: Omit<BookingOptionVariant, 'id' | 'optionTypeId'>
  ): Promise<BookingOptionVariant> => {
    try {
      // Use the main variants endpoint and include optionTypeId in the body
      const variantData = {
        ...variant,
        optionTypeId: parseInt(bookingOptionId)
      };

      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/variants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variantData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create booking option variant');
      }

      const result =
        (await response.json()) as ApiResponse<BookingOptionVariant>;
      return result.data!;
    } catch (error) {
      console.error('Error creating booking option variant:', error);
      throw error;
    }
  },

  // Update variant (new endpoint)
  update: async (
    variantId: number,
    variant: Partial<BookingOptionVariant>
  ): Promise<BookingOptionVariant> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/variants/${variantId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variant)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update booking option variant');
      }

      const result =
        (await response.json()) as ApiResponse<BookingOptionVariant>;
      return result.data!;
    } catch (error) {
      console.error('Error updating booking option variant:', error);
      throw error;
    }
  },

  // Update variant for specific option type (legacy endpoint)
  updateForOptionType: async (
    bookingOptionId: string,
    variantId: number,
    variant: Partial<BookingOptionVariant>
  ): Promise<BookingOptionVariant> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/${bookingOptionId}/variants/${variantId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variant)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update booking option variant');
      }

      const result =
        (await response.json()) as ApiResponse<BookingOptionVariant>;
      return result.data!;
    } catch (error) {
      console.error('Error updating booking option variant:', error);
      throw error;
    }
  },

  // Delete variant (new endpoint)
  delete: async (variantId: number): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/variants/${variantId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete booking option variant');
      }
    } catch (error) {
      console.error('Error deleting booking option variant:', error);
      throw error;
    }
  },

  // Delete variant for specific option type (legacy endpoint)
  deleteForOptionType: async (
    bookingOptionId: string,
    variantId: number
  ): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/booking-options/types/${bookingOptionId}/variants/${variantId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete booking option variant');
      }
    } catch (error) {
      console.error('Error deleting booking option variant:', error);
      throw error;
    }
  }
};
