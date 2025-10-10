import {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  UpdateSortOrderDto
} from '@/interface/Brand';
import { fetchWithAuth } from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

export async function getAllBrands(): Promise<ApiResponse<Brand[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/brands`);

    if (!response.ok) {
      throw new Error('Failed to fetch brands');
    }

    const responseData = (await response.json()) as {
      status: number;
      data: Brand[];
    };

    // Handle both response formats
    const brands = responseData.data || responseData;

    return {
      status: 'success',
      data: Array.isArray(brands) ? brands : [],
      error: undefined,
      message: 'Brands fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading brands:', error);
    throw error;
  }
}

export async function getBrandById(id: number): Promise<ApiResponse<Brand>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/brands/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch brand with id ${id}`);
    }

    const responseData = (await response.json()) as
      | Brand
      | { status: number; data: Brand };

    console.log('🏷️ API: getBrandById response:', {
      responseData,
      hasId:
        responseData &&
        typeof responseData === 'object' &&
        'id' in responseData,
      hasData:
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData,
      isWrappedResponse:
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData &&
        'status' in responseData
    });

    // Handle both response formats - direct object or wrapped object
    let brand: Brand;
    if (
      responseData &&
      typeof responseData === 'object' &&
      'data' in responseData &&
      'status' in responseData
    ) {
      // Wrapped response: { status: 200, data: Brand }
      brand = (responseData as { status: number; data: Brand }).data;
    } else {
      // Direct response: Brand
      brand = responseData as Brand;
    }

    return {
      status: 'success',
      data: brand,
      error: undefined,
      message: 'Brand fetched successfully'
    };
  } catch (error) {
    console.error('Error loading brand:', error);
    throw error;
  }
}

export async function createBrand(
  brand: CreateBrandDto
): Promise<ApiResponse<Brand>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/brands/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brand)
    });

    if (!response.ok) {
      throw new Error('Failed to create brand');
    }
    const data = (await response.json()) as Brand;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Brand created successfully'
    };
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error;
  }
}

export async function updateBrand(
  brand: UpdateBrandDto
): Promise<ApiResponse<Brand>> {
  try {
    const { id, ...brandData } = brand;
    const response = await fetchWithAuth(`${API_URL}/admin/brands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brandData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update brand with id ${id}`);
    }
    const data = (await response.json()) as Brand;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Brand updated successfully'
    };
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
}

export async function deleteBrand(id: number): Promise<ApiResponse<Brand>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/brands/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete brand with id ${id}`);
    }
    const data = (await response.json()) as Brand;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Brand deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
}

export async function loadLogoBrand(
  id: number,
  file: File
): Promise<ApiResponse<Brand>> {
  try {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetchWithAuth(`${API_URL}/admin/brands/${id}/logo`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to load logo for brand with id ${id}`);
    }
    const data = (await response.json()) as Brand;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Logo uploaded successfully'
    };
  } catch (error) {
    console.error('Error loading brand logo:', error);
    throw error;
  }
}

export async function loadImageBrand(
  id: number,
  file: File
): Promise<ApiResponse<Brand>> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetchWithAuth(
      `${API_URL}/admin/brands/${id}/image`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load image for brand with id ${id}`);
    }
    const data = (await response.json()) as Brand;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Image uploaded successfully'
    };
  } catch (error) {
    console.error('Error loading brand image:', error);
    throw error;
  }
}

export async function getActiveBrands(): Promise<ApiResponse<Brand[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/brands/active`);

    if (!response.ok) {
      throw new Error('Failed to fetch active brands');
    }

    const data = (await response.json()) as Brand[];

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Active brands fetched successfully'
    };
  } catch (error) {
    console.error('Error loading active brands:', error);
    throw error;
  }
}

export async function restoreBrand(id: number): Promise<ApiResponse<Brand>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/brands/${id}/restore`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to restore brand with id ${id}`);
    }
    const data = (await response.json()) as Brand;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Brand restored successfully'
    };
  } catch (error) {
    console.error('Error restoring brand:', error);
    throw error;
  }
}

export async function updateBrandSortOrder(
  sortOrderData: UpdateSortOrderDto
): Promise<ApiResponse<Brand>> {
  try {
    const { id, ...data } = sortOrderData;
    const response = await fetchWithAuth(
      `${API_URL}/admin/brands/${id}/sort-order`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update sort order for brand with id ${id}`);
    }
    const responseData = (await response.json()) as Brand;

    return {
      status: 'success',
      data: responseData,
      error: undefined,
      message: 'Brand sort order updated successfully'
    };
  } catch (error) {
    console.error('Error updating brand sort order:', error);
    throw error;
  }
}
