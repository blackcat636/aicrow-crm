import { removeTokens, getCookieValue } from './auth';
import { ensureValidToken, refreshAccessToken } from './auth-utils';
import { login as authLogin, logout as authLogout } from './apiAuth';
import { useUserStore } from '@/store/useUserStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

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
    // 🎯 Проактивно перевіряємо токен за 5 хвилин до закінчення
    // ensureValidToken автоматично спробує оновити токен якщо потрібно
    await ensureValidToken();

    // Отримуємо актуальний токен після можливого оновлення
    const token = getCookieValue('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Якщо токен все ще відсутній після спроби оновлення, тільки тоді редиректимо
      const refreshToken = getCookieValue('refresh_token');
      const deviceId = getCookieValue('device_id');
      
      // Якщо немає refresh token, тоді точно редирект
      if (!refreshToken || !deviceId) {
        removeTokens();
        window.location.href = '/login';
        throw new Error('No access token available and no refresh token');
      }
      
      // Якщо є refresh token, але оновлення не вдалося, редирект
      removeTokens();
      window.location.href = '/login';
      throw new Error('Token refresh failed');
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Try to refresh token (will use lock to prevent duplicate requests)
      const refreshToken = getCookieValue('refresh_token');
      const deviceId = getCookieValue('device_id');

      if (refreshToken && deviceId) {
        // Use refreshAccessToken from auth-utils (has lock to prevent duplicates)
        const isRefreshed = await refreshAccessToken();

        if (isRefreshed) {
          // Retry the original request
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

export const login = async (email: string, password: string) => {
  try {
    const result = await authLogin(email, password);
    return result;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const result = await authLogout();

    // Clear user data from store
    const { logout } = useUserStore.getState();
    logout();

    // Redirect to login page
    window.location.href = '/login';

    return result;
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even if error, still remove tokens and user data
    removeTokens();
    const { logout } = useUserStore.getState();
    logout();
    window.location.href = '/login';
    throw error;
  }
};
