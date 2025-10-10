import { fetchWithAuth } from '../api';
import {
  Location,
  LocationsApiResponse,
  LocationApiResponse,
  CreateLocationDto,
  UpdateLocationDto
} from '@/interface/Location';

export interface Timezone {
  name: string;
  offset: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function getTimezones(): Promise<Timezone[]> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/technical/timezones`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch timezones');
    }

    const responseData = (await response.json()) as
      | Timezone[]
      | { status: number; data: Timezone[]; message: string };

    // Handle both response formats - direct array or wrapped object
    const timezones = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return Array.isArray(timezones) ? timezones : [];
  } catch (error) {
    console.error('Error in getTimezones:', error);
    return [];
  }
}

export async function getAllLocations(): Promise<LocationsApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/locations`);

    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    const responseData = (await response.json()) as
      | Location[]
      | LocationsApiResponse;

    // Handle both response formats - direct array or wrapped object
    const locations = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return {
      status: 200,
      data: locations as Location[],
      total: locations.length,
      page: 1,
      limit: locations.length,
      totalPages: 1
    };
  } catch (error) {
    console.error('❌ API: Error in getAllLocations:', error);
    return {
      status: 0,
      data: [],
      total: 0,
      page: 0,
      limit: 0,
      totalPages: 0
    };
  }
}

export async function getLocationById(
  id: number
): Promise<LocationApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/locations/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch location with id ${id}`);
    }
    const data = (await response.json()) as LocationApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || `Failed to fetch location with id ${id}`);
    }
  } catch (error) {
    console.error('❌ API: Error in getLocationById:', error);
    return defaultErrorResponse;
  }
}

export async function createLocation(
  locationData: CreateLocationDto
): Promise<LocationApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/locations/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    if (!response.ok) {
      throw new Error('Failed to create location');
    }
    const data = (await response.json()) as LocationApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to create location');
    }
  } catch (error) {
    console.error('❌ API: Error in createLocation:', error);
    return defaultErrorResponse;
  }
}

export async function updateLocation(
  id: number,
  locationData: UpdateLocationDto
): Promise<LocationApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update location');
    }
    const data = (await response.json()) as LocationApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update location');
    }
  } catch (error) {
    console.error('❌ API: Error in updateLocation:', error);
    return defaultErrorResponse;
  }
}

export async function deleteLocation(id: number): Promise<LocationApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/locations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete location');
    }
    const data = (await response.json()) as LocationApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to delete location');
    }
  } catch (error) {
    console.error('❌ API: Error in deleteLocation:', error);
    return defaultErrorResponse;
  }
}

export async function toggleLocationActive(
  id: number
): Promise<LocationApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/locations/${id}/toggle-active`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to toggle location active status');
    }
    const data = (await response.json()) as LocationApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(
        data.message || 'Failed to toggle location active status'
      );
    }
  } catch (error) {
    console.error('❌ API: Error in toggleLocationActive:', error);
    return defaultErrorResponse;
  }
}

const defaultErrorResponse: LocationApiResponse = {
  status: 0,
  message: 'Network error',
  data: {
    id: 0,
    name: '',
    address: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
    description: '',
    timezone: '',
    isActive: false,
    createdAt: '',
    updatedAt: ''
  }
};
