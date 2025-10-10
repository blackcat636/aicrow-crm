import {
  BookingOptionVariant,
  CreateBookingOptionVariantDto,
  UpdateBookingOptionVariantDto
} from '@/interface/BookingOptionType';
import { fetchWithAuth } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

class BookingOptionVariantsApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetchWithAuth(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    const result = data.data || data;

    // Ensure numeric fields are properly converted
    if (Array.isArray(result)) {
      return result.map((item) => ({
        ...item,
        price:
          typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        optionTypeId:
          typeof item.optionTypeId === 'string'
            ? parseInt(item.optionTypeId)
            : item.optionTypeId,
        sortOrder:
          typeof item.sortOrder === 'string'
            ? parseInt(item.sortOrder)
            : item.sortOrder
      })) as T;
    } else if (result && typeof result === 'object') {
      return {
        ...result,
        price:
          typeof result.price === 'string'
            ? parseFloat(result.price)
            : result.price,
        id: typeof result.id === 'string' ? parseInt(result.id) : result.id,
        optionTypeId:
          typeof result.optionTypeId === 'string'
            ? parseInt(result.optionTypeId)
            : result.optionTypeId,
        sortOrder:
          typeof result.sortOrder === 'string'
            ? parseInt(result.sortOrder)
            : result.sortOrder
      };
    }

    return result;
  }

  async getByOptionType(optionTypeId: number): Promise<BookingOptionVariant[]> {
    return this.request<BookingOptionVariant[]>(
      `/admin/booking-options/types/${optionTypeId}/variants`
    );
  }

  async getById(id: number): Promise<BookingOptionVariant> {
    return this.request<BookingOptionVariant>(
      `/admin/booking-options/variants/${id}`
    );
  }

  async create(
    data: CreateBookingOptionVariantDto
  ): Promise<BookingOptionVariant> {
    return this.request<BookingOptionVariant>(
      '/admin/booking-options/variants',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  async update(
    id: number,
    data: UpdateBookingOptionVariantDto
  ): Promise<BookingOptionVariant> {
    return this.request<BookingOptionVariant>(
      `/admin/booking-options/variants/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  async delete(id: number): Promise<void> {
    return this.request<void>(`/admin/booking-options/variants/${id}`, {
      method: 'DELETE'
    });
  }

  // Public endpoints for users
  async getPublicVariants(
    optionTypeId: number
  ): Promise<BookingOptionVariant[]> {
    return this.request<BookingOptionVariant[]>(
      `/booking-options/types/${optionTypeId}/variants`
    );
  }
}

export const bookingOptionVariantsApi = new BookingOptionVariantsApi();
