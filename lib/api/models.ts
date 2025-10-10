import { fetchWithAuth } from '../api';
import { CreateModelDto, Model, UpdateModelDto } from '@/interface/Model';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

export async function getAllModels(): Promise<ApiResponse<Model[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/models`);

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const responseData = (await response.json()) as {
      status: number;
      data: Model[];
    };

    // Handle both response formats
    const models = responseData.data || responseData;

    return {
      status: 'success',
      data: Array.isArray(models) ? models : [],
      error: undefined,
      message: 'Models fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading models:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function getModelById(id: number): Promise<ApiResponse<Model>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/models/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch model with id ${id}`);
    }
    const data = (await response.json()) as Model;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Model fetched successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}
export async function getModelsByBrandId(
  brandId: number
): Promise<ApiResponse<Model[]>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/models/brand/${brandId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch models by brand id ${brandId}`);
    }
    const data = (await response.json()) as Model[];

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Models fetched successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function createModel(
  model: CreateModelDto
): Promise<ApiResponse<Model>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/models/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(model)
    });

    if (!response.ok) {
      throw new Error('Failed to create model');
    }
    const data = (await response.json()) as Model;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Model created successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function updateModel(
  model: UpdateModelDto
): Promise<ApiResponse<Model>> {
  try {
    const { id, ...modelData } = model;
    const response = await fetchWithAuth(`${API_URL}/admin/models/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modelData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update model with id ${id}`);
    }
    const data = (await response.json()) as Model;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Model updated successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function deleteModel(id: number): Promise<ApiResponse<Model>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/models/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete model with id ${id}`);
    }
    const data = (await response.json()) as Model;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Model deleted successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function getActiveModels(): Promise<ApiResponse<Model[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/models/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch active models');
    }
    const data = (await response.json()) as Model[];

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Active models fetched successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function restoreModel(id: number): Promise<ApiResponse<Model>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/models/${id}/restore`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to restore model with id ${id}`);
    }
    const data = (await response.json()) as Model;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Model restored successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}
