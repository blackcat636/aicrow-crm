import {
  BookingOptionType,
  CreateBookingOptionTypeDto,
  UpdateBookingOptionTypeDto
} from '@/interface/BookingOptionType';
import { fetchWithAuth } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

class BookingOptionTypesApi {
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
        basePrice:
          typeof item.basePrice === 'string'
            ? parseFloat(item.basePrice)
            : item.basePrice,
        id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        sortOrder:
          typeof item.sortOrder === 'string'
            ? parseInt(item.sortOrder)
            : item.sortOrder
      })) as T;
    } else if (result && typeof result === 'object') {
      return {
        ...result,
        basePrice:
          typeof result.basePrice === 'string'
            ? parseFloat(result.basePrice)
            : result.basePrice,
        id: typeof result.id === 'string' ? parseInt(result.id) : result.id,
        sortOrder:
          typeof result.sortOrder === 'string'
            ? parseInt(result.sortOrder)
            : result.sortOrder
      };
    }

    return result;
  }

  async getAll(): Promise<BookingOptionType[]> {
    return this.request<BookingOptionType[]>('/admin/booking-options/types');
  }

  async getById(id: number): Promise<BookingOptionType> {
    return this.request<BookingOptionType>(
      `/admin/booking-options/types/${id}`
    );
  }

  async getByIdWithVariants(id: number): Promise<BookingOptionType> {
    return this.request<BookingOptionType>(
      `/admin/booking-options/types/${id}?includeVariants=true`
    );
  }

  async getAllWithVariants(): Promise<BookingOptionType[]> {
    return this.request<BookingOptionType[]>(
      '/admin/booking-options/types?includeVariants=true'
    );
  }

  async create(data: CreateBookingOptionTypeDto): Promise<BookingOptionType> {
    return this.request<BookingOptionType>('/admin/booking-options/types', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(
    id: number,
    data: UpdateBookingOptionTypeDto
  ): Promise<BookingOptionType> {
    return this.request<BookingOptionType>(
      `/admin/booking-options/types/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  async delete(id: number): Promise<void> {
    return this.request<void>(`/admin/booking-options/types/${id}`, {
      method: 'DELETE'
    });
  }

  // Public endpoints for users
  async getPublicTypes(): Promise<BookingOptionType[]> {
    return this.request<BookingOptionType[]>('/booking-options/types');
  }
}

export const bookingOptionTypesApi = new BookingOptionTypesApi();
