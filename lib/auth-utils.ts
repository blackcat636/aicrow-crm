/**
 * 🔧 Auth Utils - Утиліти для роботи з токенами
 *
 * Цей файл містить допоміжні функції для:
 * - Декодування JWT токенів
 * - Проактивного оновлення токенів
 * - Retry логіки з exponential backoff
 * - Роботи з cookies
 */

import { getCookieValue, setTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

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
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getCookieValue('refresh_token');
  const deviceId = getCookieValue('device_id');

  if (!refreshToken || !deviceId) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify({ refreshToken, deviceId })
    });

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
    console.error('❌ Token refresh error:', error);
    return false;
  }
};

/**
 * 🎯 Проактивно перевіряє та оновлює токен за 5 хвилин до закінчення
 */
export const ensureValidToken = async (): Promise<boolean> => {
  const token = getCookieValue('access_token');

  if (!token) {
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - now;

  // Якщо залишилось менше 5 хвилин (300 секунд) - оновлюємо токен
  if (timeLeft <= 300) {
    return await refreshAccessToken();
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

/**
 * 🍪 Утиліти для роботи з cookies
 */
export const cookieUtils = {
  /**
   * Встановлює cookie з вказаними параметрами
   */
  setCookieValue: (name: string, value: string, maxAge: number = -1) => {
    if (typeof window === 'undefined') return;

    let cookieString = `${name}=${value}; path=/`;

    if (maxAge > 0) {
      cookieString += `; max-age=${maxAge}`;
    }

    // Додаємо secure прапор в production
    if (process.env.NODE_ENV === 'production') {
      cookieString += '; secure';
    }

    cookieString += '; samesite=strict';

    document.cookie = cookieString;
  },

  /**
   * Отримує значення cookie за іменем
   */
  getCookieValue: (name: string): string | null => {
    if (typeof window === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  },

  /**
   * Видаляє cookie
   */
  deleteCookie: (name: string) => {
    if (typeof window === 'undefined') return;

    document.cookie = `${name}=; path=/; max-age=0`;
  }
};

/**
 * 🔐 Утиліти для безпеки
 */
export const securityUtils = {
  /**
   * Перевіряє чи токен не прострочений
   */
  isTokenExpired: (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp <= now;
  },

  /**
   * Отримує час до закінчення токена в секундах
   */
  getTokenTimeLeft: (token: string): number => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  },

  /**
   * Перевіряє чи потрібно оновити токен (менше 5 хвилин)
   */
  shouldRefreshToken: (token: string): boolean => {
    const timeLeft = securityUtils.getTokenTimeLeft(token);
    return timeLeft > 0 && timeLeft <= 300; // 5 хвилин
  }
};

/**
 * 📊 Утиліти для моніторингу
 */
export const monitoringUtils = {
  /**
   * Логує інформацію про токен
   */
  logTokenInfo: (token: string) => {
    const decoded = decodeToken(token);
    if (!decoded) {
      return;
    }
  }

  /**
   * Перевіряє стан всіх токенів
   */
};
