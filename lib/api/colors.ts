import { fetchWithAuth } from '../api';
import { Color, CreateColorDto, UpdateColorDto } from '@/interface/Color';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

export async function getAllColors(): Promise<ApiResponse<Color[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/colors`);

    if (!response.ok) {
      throw new Error('Failed to fetch colors');
    }

    const responseData = (await response.json()) as
      | Color[]
      | { status: number; data: Color[] };

    // Handle both response formats - direct array or wrapped object
    const colors = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return {
      status: 'success',
      data: Array.isArray(colors) ? colors : [],
      error: undefined,
      message: 'Colors fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading colors:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function getColorById(id: number): Promise<ApiResponse<Color>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/colors/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch color with id ${id}`);
    }

    const responseData = (await response.json()) as
      | Color
      | { status: number; data: Color };

    // Handle both response formats - direct object or wrapped object
    const color =
      responseData && typeof responseData === 'object' && 'id' in responseData
        ? (responseData as Color)
        : (responseData as { data: Color }).data;

    return {
      status: 'success',
      data: color,
      error: undefined,
      message: 'Color fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading color:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function getActiveColors(): Promise<ApiResponse<Color[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/colors/active`);

    if (!response.ok) {
      throw new Error('Failed to fetch active colors');
    }

    const responseData = (await response.json()) as
      | Color[]
      | { status: number; data: Color[] };

    // Handle both response formats - direct array or wrapped object
    const colors = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return {
      status: 'success',
      data: Array.isArray(colors) ? colors : [],
      error: undefined,
      message: 'Active colors fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading active colors:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function createColor(
  color: CreateColorDto
): Promise<ApiResponse<Color>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/colors/create`, // Fixed double admin
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(color)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create color');
    }
    const data = (await response.json()) as ApiResponse<Color>;

    // Check for both string 'success' and number 200 status
    if (data.status === 'success' || data.status === 200) {
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

export async function updateColor(
  color: UpdateColorDto
): Promise<ApiResponse<Color>> {
  try {
    const { id, ...colorData } = color;

    const response = await fetchWithAuth(`${API_URL}/admin/colors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(colorData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update color with id ${id}`);
    }
    const data = (await response.json()) as ApiResponse<Color>;

    // Check for both string 'success' and number 200 status
    if (data.status === 'success' || data.status === 200) {
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

export async function deleteColor(id: number): Promise<ApiResponse<Color>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/colors/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - insufficient rights for deletion');
      } else if (response.status === 403) {
        throw new Error('Forbidden - access denied');
      } else if (response.status === 404) {
        throw new Error('Not Found - color not found');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = (await response.json()) as ApiResponse<Color>;

    // Check for both string 'success' and number 200 status
    if (data.status === 'success' || data.status === 200) {
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
    if (error instanceof Error) {
      return {
        status: 'error',
        error: error.message
      };
    }
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}
