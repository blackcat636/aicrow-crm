/**
 * 🔧 Auth Utils - Утиліти для роботи з токенами
 *
 * Цей файл містить допоміжні функції для:
 * - Декодування JWT токенів
 * - Проактивного оновлення токенів
 * - Retry логіки з exponential backoff
 * - Роботи з cookies
 */

import { getCookieValue, setTokens, removeTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

// Lock to prevent concurrent refresh requests
let refreshInProgress = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * 🔍 Декодує JWT токен та повертає payload
 */
export const decodeToken = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
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
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

/**
 * 🔄 Оновлює access token через refresh token
 * Захищено від одночасних викликів - якщо refresh вже виконується, повертає той самий Promise
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  // If refresh is already in progress, return the existing promise
  if (refreshInProgress && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getCookieValue('refresh_token');
  const deviceId = getCookieValue('device_id');

  if (!refreshToken || !deviceId) {
    return false;
  }

  // Set lock and create promise
  refreshInProgress = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId
        },
        body: JSON.stringify({ refreshToken, deviceId })
      });

    // Handle non-OK responses
    if (!response.ok) {
      // If 401, refresh token is invalid - clear tokens and return false
      if (response.status === 401) {
        // Clear invalid tokens
        removeTokens();
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔐 Refresh token is invalid or expired. User needs to login again.');
        }
        return false;
      }
      
      // For other errors, try to parse error message
      try {
        const errorData = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Token refresh error:', errorData.message || `Status ${response.status}`);
        }
      } catch {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Token refresh error: Status', response.status);
        }
      }
      return false;
    }

    const data = await response.json();

    if (data.status === 200 && data.data) {
      // Оновлюємо токени в cookies
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        deviceId: deviceId
      });
      return true;
    } else {
      return false;
    }
    } catch (error) {
      // Network errors or other fetch errors
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Token refresh error:', error instanceof Error ? error.message : String(error));
      }
      return false;
    } finally {
      // Release lock after 1 second to allow new refresh if needed
      setTimeout(() => {
        refreshInProgress = false;
        refreshPromise = null;
      }, 1000);
    }
  })();

  return refreshPromise;
};

/**
 * 🎯 Проактивно перевіряє та оновлює токен за 5 хвилин до закінчення
 */
export const ensureValidToken = async (): Promise<boolean> => {
  const token = getCookieValue('access_token');

  if (!token) {
    // Якщо токен відсутній, спробуємо оновити через refresh token
    const refreshToken = getCookieValue('refresh_token');
    const deviceId = getCookieValue('device_id');
    if (refreshToken && deviceId) {
      return await refreshAccessToken();
    }
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    // Якщо токен невалідний, спробуємо оновити через refresh token
    const refreshToken = getCookieValue('refresh_token');
    const deviceId = getCookieValue('device_id');
    if (refreshToken && deviceId) {
      return await refreshAccessToken();
    }
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - now;

  // Якщо токен прострочений (timeLeft <= 0) або залишилось менше 5 хвилин (300 секунд) - оновлюємо токен
  if (timeLeft <= 300) {
    const refreshed = await refreshAccessToken();
    // Якщо оновлення не вдалося, але токен ще не прострочений (0 < timeLeft <= 300), продовжуємо з поточним токеном
    // Якщо токен прострочений (timeLeft <= 0), повертаємо результат оновлення
    if (timeLeft <= 0) {
      return refreshed;
    }
    // Якщо оновлення не вдалося, але токен ще валідний, продовжуємо
    return refreshed || true;
  }

  return true;
};

/**
 * 🔄 Retry логіка з exponential backoff
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

// Removed unused utilities: cookieUtils, securityUtils, monitoringUtils
// These were not being used anywhere in the codebase
