import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

export function getTokens(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const deviceId = request.cookies.get('device_id')?.value;
  return { accessToken, refreshToken, deviceId };
}

export function setTokens(tokens: AuthTokens, response?: NextResponse) {
  if (response) {
    response.cookies.set('access_token', tokens.accessToken, {
      path: '/',
      maxAge: 3600,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    response.cookies.set('refresh_token', tokens.refreshToken, {
      path: '/',
      maxAge: 86400,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    response.cookies.set('device_id', tokens.deviceId, {
      path: '/',
      maxAge: 86400,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  if (typeof window !== 'undefined') {
    document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=3600`;
    document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=86400`;
    document.cookie = `device_id=${tokens.deviceId}; path=/; max-age=86400`;
  }
}

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

export const removeTokens = (response?: NextResponse) => {
  if (typeof window !== 'undefined') {
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
    document.cookie = 'device_id=; path=/; max-age=0';
  }

  if (response) {
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('device_id');
  }
};

export async function isAuthenticatedServer(
  accessToken: string | undefined
): Promise<boolean> {
  if (!accessToken) {
    console.log('🔐 No access token provided');
    return false;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(accessToken, secret);

    // Check if token has not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('🔐 Token expired:', {
        exp: payload.exp,
        now: now,
        expiredAt: new Date(payload.exp * 1000).toISOString()
      });
      return false;
    }

    console.log('✅ Token is valid');
    return true;
  } catch (error) {
    console.error('🔐 Token validation error:', {
      error: error instanceof Error ? error.message : String(error),
      tokenPreview: accessToken.substring(0, 20) + '...'
    });
    return false;
  }
}

export async function refreshAccessToken(
  request: NextRequest
): Promise<NextResponse | null> {
  const { refreshToken, deviceId } = getTokens(request);

  if (!refreshToken || !deviceId) {
    console.log('🔄 Refresh failed: Missing refresh token or device ID');
    return null;
  }

  try {
    console.log('🔄 Attempting to refresh token...');

    const response = await globalThis.fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify({ refreshToken, deviceId })
    });

    console.log('🔄 Refresh response status:', response.status);

    const data = await response.json();
    console.log('🔄 Refresh response data:', {
      status: data.status,
      hasData: !!data.data
    });

    // Check only status in data, since server returns 201
    if (data.status === 200 && data.data) {
      console.log('✅ Token refresh successful');
      const newResponse = NextResponse.next();

      // Set new tokens in cookies
      newResponse.cookies.set('access_token', data.data.accessToken, {
        path: '/',
        maxAge: 3600,
        httpOnly: false, // Change to false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      newResponse.cookies.set('refresh_token', data.data.refreshToken, {
        path: '/',
        maxAge: 86400,
        httpOnly: false, // Change to false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      // Keep old deviceId, since it does not change
      newResponse.cookies.set('device_id', deviceId, {
        path: '/',
        maxAge: 86400,
        httpOnly: false, // Change to false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return newResponse;
    }

    console.log('❌ Token refresh failed:', data);
    return null;
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    return null;
  }
}

export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Read from cookies instead of cookies
  const token = getCookieValue('access_token');
  if (!token) {
    return false;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const isValid = decoded.exp > now;
    return isValid;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const refreshTokenClient = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  const refreshToken = getRefreshToken();
  const deviceId = getDeviceId();

  if (!refreshToken || !deviceId) {
    console.log('❌ No refresh token or device ID available');
    return false;
  }

  try {
    console.log('🔄 Client: Attempting to refresh token...');

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
      console.log('✅ Client: Token refreshed successfully');

      // Update cookies with new tokens
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        deviceId: deviceId
      });

      return true;
    } else {
      console.log('❌ Client: Token refresh failed:', data);

      // If refresh token is also invalid, clear all tokens
      if (data.status === 401) {
        console.log('🧹 Clearing invalid tokens...');
        removeTokens();
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Client: Token refresh error:', error);
    return false;
  }
};
