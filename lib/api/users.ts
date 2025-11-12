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

  // Use Next.js API route instead of direct backend call
  const url = `/api/admin/users?${params}`;

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
        status: rawData.status || 200,
        message: rawData.message || 'Users retrieved successfully',
        data: rawData.data.items,
        total: rawData.data.total ?? 0,
        page: rawData.data.page ?? page,
        limit: rawData.data.limit ?? limit
      };
    } else if (Array.isArray(rawData.data)) {
      // Format 1: flat structure with data array
      data = {
        status: rawData.status || 200,
        message: rawData.message || 'Users retrieved successfully',
        data: rawData.data,
        total: rawData.total ?? 0,
        page: rawData.page ?? page,
        limit: rawData.limit ?? limit
      };
    } else {
      // Fallback: try to use rawData as is
      data = {
        status: rawData.status || 200,
        message: rawData.message || 'Users retrieved successfully',
        data: Array.isArray(rawData.data) ? rawData.data : [],
        total: rawData.total ?? 0,
        page: rawData.page ?? page,
        limit: rawData.limit ?? limit
      };
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
        timezone: null,
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}

// Create new user
export async function createUser(userData: {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
  isEmailVerified?: boolean;
  isActive?: boolean;
}): Promise<UserApiResponse> {
  try {
    const url = `${API_URL}/admin/users`;
    const requestBody = JSON.stringify(userData);

    console.log('🔵 Creating user:', {
      url,
      method: 'POST',
      data: { ...userData, password: '***' },
      requestBody: requestBody
    });

    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: requestBody
    });

    console.log('🔵 Response status:', response.status, response.statusText);
    console.log(
      '🔵 Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    let data: UserApiResponse;
    try {
      const responseText = await response.text();
      console.log('🔵 Response text:', responseText);
      data = JSON.parse(responseText) as UserApiResponse;
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new Error(
        `Failed to parse response: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      const errorMessage =
        data.message || `Failed to create user (${response.status})`;
      console.error('❌ Create user error:', {
        status: response.status,
        statusText: response.statusText,
        data,
        requestData: { ...userData, password: '***' }
      });
      throw new Error(errorMessage);
    }

    console.log('✅ User created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(
  id: number,
  userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    timezone?: string;
    role?: 'user' | 'admin';
    isEmailVerified?: boolean;
    isActive?: boolean;
    referredByCode?: string | null;
  }
): Promise<UserApiResponse> {
  try {
    const response = await fetchWithAuth(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = (await response.json()) as UserApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user (soft delete)
export async function deleteUser(
  id: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Change user password
export async function changeUserPassword(
  id: number,
  password: string,
  confirmPassword: string
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(`/api/admin/users/${id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password, confirmPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  id: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/users/${id}/reset-password`,
      {
        method: 'POST'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send password reset email');
    }

    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Resend verification email
export async function resendVerificationEmail(
  id: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/users/${id}/resend-verification`,
      {
        method: 'POST'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification email');
    }

    return data;
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
}

// Confirm email manually
export async function confirmUserEmail(id: number): Promise<UserApiResponse> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/users/${id}/confirm-email`,
      {
        method: 'POST'
      }
    );

    const data = (await response.json()) as UserApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to confirm email');
    }

    return data;
  } catch (error) {
    console.error('Error confirming email:', error);
    throw error;
  }
}

// Update user status (activate/block)
export async function updateUserStatus(
  id: number,
  isActive: boolean
): Promise<UserApiResponse> {
  try {
    const response = await fetchWithAuth(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive })
    });

    const data = (await response.json()) as UserApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user status');
    }

    return data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}
