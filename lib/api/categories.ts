import { fetchWithAuth } from '../api';
import {
  CategoriesApiResponse,
  CategoryApiResponse,
  CreateCategoryDto,
  UpdateCategoryDto
} from '@/interface/Category';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function getAllCategories(
  page: number = 1,
  limit: number = 10
): Promise<CategoriesApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/categories?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = (await response.json()) as CategoriesApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error('Failed to fetch categories');
    }
  } catch (error) {
    console.error('❌ API: Error in getAllCategories:', error);
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

export async function getCategoryById(
  id: number
): Promise<CategoryApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/categories/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch category with id ${id}`);
    }
    const data = (await response.json()) as CategoryApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || `Failed to fetch category with id ${id}`);
    }
  } catch (error) {
    console.error('❌ API: Error in getCategoryById:', error);
    return defaultErrorResponse;
  }
}

export async function createCategory(
  categoryData: CreateCategoryDto
): Promise<CategoryApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    const data = (await response.json()) as CategoryApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to create category');
    }
  } catch (error) {
    console.error('❌ API: Error in createCategory:', error);
    return defaultErrorResponse;
  }
}

export async function updateCategory(
  id: number,
  categoryData: UpdateCategoryDto
): Promise<CategoryApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update category');
    }
    const data = (await response.json()) as CategoryApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update category');
    }
  } catch (error) {
    console.error('❌ API: Error in updateCategory:', error);
    return defaultErrorResponse;
  }
}

export async function deleteCategory(id: number): Promise<CategoryApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/categories/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
    const data = (await response.json()) as CategoryApiResponse;

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to delete category');
    }
  } catch (error) {
    console.error('❌ API: Error in deleteCategory:', error);
    return defaultErrorResponse;
  }
}

const defaultErrorResponse: CategoryApiResponse = {
  status: 0,
  message: 'Network error',
  data: {
    id: 0,
    name: '',
    description: '',
    isActive: false,
    createdAt: '',
    updatedAt: ''
  }
};
