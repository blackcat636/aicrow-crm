import { fetchWithAuth } from '../api';
import { UsersApiResponse, UserApiResponse } from '@/interface/User';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function getAllUsers(
  page: number = 1,
  limit: number = 10
): Promise<UsersApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/users?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data = (await response.json()) as UsersApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('❌ API: Error in getAllUsers:', error);
    return {
      status: 0,
      message: 'Network error',
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
    console.error('❌ API: Error in getUserById:', error);
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
