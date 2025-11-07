import { fetchWithAuth } from '../api';
import { UsersApiResponse, UserApiResponse } from '@/interface/User';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
).replace(/\/+$/, '');

export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<UsersApiResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  
  const url = `${API_URL}/admin/users?${params}`;

  try {
    const response = await fetchWithAuth(url);
    const rawData = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: rawData.message || 'Failed to fetch users',
        data: [],
        total: 0,
        page: 0,
        limit: 0
      };
    }

    // Handle both response formats:
    // Format 1: { status: 200, data: [...], total, page, limit }
    // Format 2: { status: 200, data: { items: [...], total, page, limit } }
    let data: UsersApiResponse;

    if (rawData.data && Array.isArray(rawData.data.items)) {
      // Format 2: nested structure
      data = {
        status: rawData.status,
        message: rawData.message,
        data: rawData.data.items,
        total: rawData.data.total,
        page: rawData.data.page,
        limit: rawData.data.limit
      };
    } else {
      // Format 1: flat structure
      data = rawData as UsersApiResponse;
    }

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      return {
        status: data.status || 500,
        message: data.message || 'Failed to fetch users',
        data: [],
        total: 0,
        page: 0,
        limit: 0
      };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
      data: [],
      total: 0,
      page: 0,
      limit: 0
    };
  }
}

export async function getUserById(id: number): Promise<UserApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user with id ${id}`);
    }
    const data = (await response.json()) as UserApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || `Failed to fetch user with id ${id}`);
    }
  } catch (error) {
    console.error('Error fetching user by id:', error);
    return {
      status: 0,
      message: 'Network error',
      data: {
        id: 0,
        uuid: '',
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        phone: null,
        photo: null,
        dateOfBirth: null,
        role: 'user',
        balance: '0.00',
        frozenBalance: '0.00',
        isEmailVerified: false,
        referralCode: null,
        referredByCode: null,
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}
