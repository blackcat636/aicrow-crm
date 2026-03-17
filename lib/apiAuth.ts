/**
 * 🔐 API Auth - API виклики для аутентифікації
 *
 * Цей файл містить функції для:
 * - Логіну користувача
 * - Оновлення токенів
 * - Виходу з системи
 * - Генерації Device ID
 */

import { v4 as uuidv4 } from 'uuid';
import { setTokens, removeTokens, getCookieValue } from './auth';

// Remove trailing slash to avoid double slashes in requests
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010').replace(
  /\/+$/,
  ''
);

/**
 * 🆔 Генерує та зберігає унікальний Device ID
 */
export const generateDeviceId = (): string => {
  let deviceId = getCookieValue('device_id');

  if (!deviceId) {
    deviceId = uuidv4();
    // Device ID will be saved when tokens are set during login via setTokens()
    // For now, we'll set it manually if needed before login
    if (typeof window !== 'undefined') {
      document.cookie = `device_id=${deviceId}; path=/; max-age=31536000; samesite=strict${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
    }
  }

  return deviceId;
};

/**
 * 🔐 Логін користувача
 */
export const login = async (email: string, password: string) => {
  const deviceId = generateDeviceId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId
  };

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password, deviceId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.status === 200 && data.data) {
      // Зберігаємо токени
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        deviceId: deviceId
      });

      return {
        success: true,
        user: data.data.user,
        message: 'Login successful'
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

/**
 * 🔄 Оновлення токенів
 * 
 * ⚠️ Legacy function - returns object instead of boolean
 * For new code, use refreshAccessToken() from auth-utils.ts which has lock mechanism
 * to prevent concurrent refresh requests.
 */
export const refreshToken = async () => {
  const refreshToken = getCookieValue('refresh_token');
  const deviceId = getCookieValue('device_id');

  if (!refreshToken || !deviceId) {
    throw new Error('No refresh token or device ID available');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId
  };

  try {
    // Swagger expects: header x-device-id + body { refreshToken }
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    if (data.status === 200 && data.data) {
      // Оновлюємо токени
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        deviceId: deviceId
      });

      return {
        success: true,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        message: 'Token refreshed successfully'
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    throw error;
  }
};

/**
 * 🚪 Вихід з системи
 */
export const logout = async () => {
  const refreshToken = getCookieValue('refresh_token');
  const deviceId = getCookieValue('device_id');

  if (!refreshToken || !deviceId) {
    // Якщо немає токенів, просто очищаємо локально
    removeTokens();
    return { success: true, message: 'Logged out locally' };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId
  };

  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refreshToken, deviceId })
    });

    const data = await response.json();

    // Незалежно від відповіді сервера, очищаємо токени локально
    removeTokens();

    if (response.ok && data.status === 200) {
      return {
        success: true,
        message: data.message || 'Logged out successfully'
      };
    } else {
      return {
        success: true,
        message: 'Logged out locally (server error)'
      };
    }
  } catch {
    // Навіть при помилці очищаємо токени
    removeTokens();
    return {
      success: true,
      message: 'Logged out locally (network error)'
    };
  }
};

/**
 * 🔍 Перевірка статусу аутентифікації
 */
export const checkAuthStatus = async () => {
  const accessToken = getCookieValue('access_token');
  const refreshToken = getCookieValue('refresh_token');
  const deviceId = getCookieValue('device_id');

  return {
    isAuthenticated: !!(accessToken && refreshToken && deviceId),
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasDeviceId: !!deviceId,
    deviceId: deviceId
  };
};

/**
 * 🛡️ Валідація токенів
 */
export const validateTokens = async () => {
  const accessToken = getCookieValue('access_token');

  if (!accessToken) {
    return { valid: false, reason: 'No access token' };
  }

  try {
    // Простий JWT валідація (перевірка структури)
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'Invalid token format' };
    }

    // Декодуємо payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= now) {
      return { valid: false, reason: 'Token expired' };
    }

    return {
      valid: true,
      expiresAt: new Date(payload.exp * 1000),
      timeLeft: payload.exp - now
    };
  } catch {
    return { valid: false, reason: 'Token decode error' };
  }
};

// Removed unused utilities: apiUtils.ensureValidToken (use ensureValidToken from auth-utils.ts instead)
// Removed unused utilities: authStats (not being used anywhere)
