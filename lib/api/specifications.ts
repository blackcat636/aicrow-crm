import { fetchWithAuth } from '../api';
import {
  CreateSpecificationDto,
  Specification,
  UpdateSpecificationDto
} from '@/interface/Specification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

export async function getAllSpecifications(): Promise<
  ApiResponse<Specification[]>
> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/specifications`);

    if (!response.ok) {
      throw new Error('Failed to fetch specifications');
    }

    const responseData = (await response.json()) as
      | Specification[]
      | { status: number; data: Specification[] };

    // Handle both response formats - direct array or wrapped object
    const specifications = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return {
      status: 'success',
      data: Array.isArray(specifications) ? specifications : [],
      error: undefined,
      message: 'Specifications fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading specifications:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function getSpecificationById(
  id: number
): Promise<ApiResponse<Specification>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/specifications/${id}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch specification');
    }

    const responseData = (await response.json()) as
      | Specification
      | { status: number; data: Specification };

    // Handle both response formats - direct object or wrapped object
    const specification =
      responseData && typeof responseData === 'object' && 'id' in responseData
        ? (responseData as Specification)
        : (responseData as { data: Specification }).data;

    return {
      status: 'success',
      data: specification,
      error: undefined,
      message: 'Specification fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading specification:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function searchSpecifications(): Promise<
  ApiResponse<Specification[]>
> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/specifications/search`
    );

    if (!response.ok) {
      throw new Error('Failed to search specifications');
    }

    const responseData = (await response.json()) as
      | Specification[]
      | { status: number; data: Specification[] };

    // Handle both response formats - direct array or wrapped object
    const specifications = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return {
      status: 'success',
      data: Array.isArray(specifications) ? specifications : [],
      error: undefined,
      message: 'Specifications search completed successfully'
    };
  } catch (error) {
    console.error('❌ API: Error searching specifications:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function createSpecification(
  specification: CreateSpecificationDto
): Promise<ApiResponse<Specification>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/specifications/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specification)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create specification');
    }
    const data = (await response.json()) as ApiResponse<Specification>;
    if (data.status === 'success') {
      return {
        status: data.status,
        data: data.data,
        error: data.error,
        message: data.message
      };
    }
    return {
      status: data.status,
      error: data.error,
      message: data.message
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function updateSpecification(
  specification: UpdateSpecificationDto
): Promise<ApiResponse<Specification>> {
  try {
    const { id, ...specificationData } = specification;

    const response = await fetchWithAuth(
      `${API_URL}/admin/specifications/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specificationData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update specification with id ${id}`);
    }

    const data = (await response.json()) as ApiResponse<Specification>;

    if (data.status === 'success') {
      return {
        status: data.status,
        data: data.data,
        error: data.error,
        message: data.message
      };
    }

    return {
      status: data.status,
      error: data.error,
      message: data.message
    };
  } catch (error) {
    console.error('Error updating specification:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function deleteSpecification(
  id: number
): Promise<ApiResponse<Specification>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/specifications/${id}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete specification with id ${id}`);
    }
    const data = (await response.json()) as ApiResponse<Specification>;
    if (data.status === 'success') {
      return {
        status: data.status,
        data: data.data,
        error: data.error,
        message: data.message
      };
    }
    return {
      status: data.status,
      error: data.error,
      message: data.message
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}
