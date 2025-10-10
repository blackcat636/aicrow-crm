import { removeTokens, setTokens } from './auth';
import { Brand } from '@/interface/Brand';
import { useUserStore } from '@/store/useUserStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

// const isTokenExpired = (token: string): boolean => {
//     const payload = decodeToken(token);
//     if (!payload) return true;
//     const now = Math.floor(Date.now() / 1000);
//     return payload.exp < now;
// };

export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  const deviceId = getDeviceId();

  if (!refreshToken || !deviceId) {
    return false;
  }

  try {
    const response = await globalThis.fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (response.ok && data.data) {
      // Use existing deviceId, since server may not return new one
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        deviceId: deviceId // Use existing deviceId
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    return false; // Do not throw error, return false
  }
};

// Function to read cookies
export const getCookieValue = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Function to decode JWT token
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    const token = getCookieValue('access_token');
    return token;
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    const token = getCookieValue('refresh_token');
    return token;
  }
  return null;
};

export const getDeviceId = () => {
  if (typeof window !== 'undefined') {
    const deviceId = getCookieValue('device_id');
    return deviceId;
  }
  return null;
};

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const isServer = typeof window === 'undefined';
  const headers = new Headers(options.headers);

  if (!isServer) {
    const token = getCookieValue('access_token'); // Read from cookies

    if (token) {
      // Check if not expired
      const decoded = decodeJWT(token);
      if (decoded) {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;

        if (timeLeft <= 0) {
        } else {
        }
      }

      headers.set('Authorization', `Bearer ${token}`);
    } else {
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      const refreshToken = getCookieValue('refresh_token'); // Read from cookies
      const deviceId = getCookieValue('device_id'); // Read from cookies

      if (refreshToken && deviceId) {
        const isRefreshed = await refreshAccessToken();

        if (isRefreshed) {
          return fetchWithAuth(url, options);
        } else {
          removeTokens();
          window.location.href = '/login';
        }
      } else {
        removeTokens();
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    console.error('❌ fetchWithAuth error:', error);
    throw error;
  }
}

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const res = await globalThis.fetch(`${API_URL}${endpoint}`, options);
    const data = (await res.json()) as ApiResponse<T>;

    if (res.status === 200) {
      return {
        status: res.status,
        data: data.data,
        error: data.message,
        message: data.message
      };
    }

    return {
      status: res.status,
      error: data.message,
      message: data.message
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: '500',
      error: 'Network error'
    };
  }
};

export const getBrands = async (): Promise<ApiResponse<Brand[]>> => {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/brands`);

    if (!response.ok) {
      throw new Error('Failed to fetch brands');
    }

    const data = (await response.json()) as Brand[];

    return {
      status: 'success',
      data: data,
      message: 'Brands fetched successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
};

export const login = async (email: string, password: string) => {
  const deviceId = getDeviceId();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(deviceId ? { 'x-device-id': deviceId } : {})
  };

  const response = await globalThis.fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Authentication error');
  }

  if (data.status === 200 && data.data) {
    return data.data;
  }

  throw new Error('Unknown error');
};

export const logout = async () => {
  const deviceId = getDeviceId();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(deviceId ? { 'x-device-id': deviceId } : {})
  };

  try {
    const response = await globalThis.fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error('Logout error');
    }

    // Remove tokens on client
    removeTokens();

    // Clear user data from store
    const { logout } = useUserStore.getState();
    logout();

    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    // Even if error, still remove tokens and user data
    removeTokens();
    const { logout } = useUserStore.getState();
    logout();
    window.location.href = '/login';
  }
};
