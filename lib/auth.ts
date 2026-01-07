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
      sameSite: 'strict' // Захист від CSRF атак
    });
    response.cookies.set('refresh_token', tokens.refreshToken, {
      path: '/',
      maxAge: 31536000, // 1 рік (365 днів * 24 години * 60 хвилин * 60 секунд)
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' // Захист від CSRF атак
    });
    response.cookies.set('device_id', tokens.deviceId, {
      path: '/',
      maxAge: 31536000, // 1 рік - device_id не змінюється
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' // Захист від CSRF атак
    });
  }

  if (typeof window !== 'undefined') {
    document.cookie = `access_token=${tokens.accessToken}; path=/; max-age=3600`;
    document.cookie = `refresh_token=${tokens.refreshToken}; path=/; max-age=31536000`;
    document.cookie = `device_id=${tokens.deviceId}; path=/; max-age=31536000`;
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

// Note: decodeJWT moved to auth-utils.ts as decodeToken
// Note: getAccessToken, getRefreshToken, getDeviceId moved to api.ts to avoid duplication

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
    return false;
  }

  try {
    // Decode token header to check algorithm
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return false;
    }

    let header: { alg?: string; [key: string]: unknown };
    try {
      header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return false;
    }

    const algorithm = header.alg || 'HS256';

    // Handle different algorithms
    // Key can be Uint8Array for HS* algorithms or KeyLike for RS* algorithms
    let key: Uint8Array | Awaited<ReturnType<typeof jose.importSPKI>>;

    if (
      algorithm === 'RS256' ||
      algorithm === 'RS384' ||
      algorithm === 'RS512'
    ) {
      // For RS256/RS384/RS512, we need a public key
      // Try to get public key from environment variable
      const publicKey =
        process.env.JWT_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY_PEM;

      if (publicKey) {
        // If public key is in PEM format, convert it
        try {
          key = await jose.importSPKI(publicKey, algorithm);
        } catch {
          // If import fails, try as JWK
          try {
            const jwk =
              typeof publicKey === 'string' ? JSON.parse(publicKey) : publicKey;
            key = await jose.importJWK(jwk, algorithm);
          } catch {
            // If both fail, fall back to expiration check only
            // Signature validation will be done by backend
            const payload = jose.decodeJwt(accessToken);
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
              return false;
            }
            return true; // Assume valid if not expired (backend will validate signature)
          }
        }
      } else {
        // If no public key, only check expiration
        // Signature validation will be done by backend API
        const payload = jose.decodeJwt(accessToken);
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          return false;
        }
        // Return true if token is not expired
        // Backend will validate the signature when making API calls
        return true;
      }
    } else {
      // For HS256/HS384/HS512, use secret key
      key = new TextEncoder().encode(JWT_SECRET);
    }

    const { payload } = await jose.jwtVerify(accessToken, key);

    // Check if token has not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    return true;
  } catch (error) {
    // Safely log error without exposing sensitive token data
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const tokenPreview =
      accessToken && accessToken.length > 20
        ? accessToken.substring(0, 20) + '...'
        : accessToken || 'undefined';

    // Only log in development to avoid cluttering production logs
    if (process.env.NODE_ENV === 'development') {
      console.error('🔐 Token validation error:', {
        name: errorName,
        message: errorMessage,
        tokenLength: accessToken?.length || 0,
        tokenPreview: tokenPreview
      });
    }
    return false;
  }
}

export async function refreshAccessToken(
  request: NextRequest
): Promise<NextResponse | null> {
  const { refreshToken, deviceId } = getTokens(request);

  if (!refreshToken || !deviceId) {
    return null;
  }

  try {
    const response = await globalThis.fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify({ refreshToken, deviceId })
    });

    const data = await response.json();

    // Check only status in data, since server returns 201
    if (data.status === 200 && data.data) {
      const newResponse = NextResponse.next();

      // Set new tokens in cookies
      newResponse.cookies.set('access_token', data.data.accessToken, {
        path: '/',
        maxAge: 3600,
        httpOnly: false, // Change to false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' // Захист від CSRF атак
      });
      newResponse.cookies.set('refresh_token', data.data.refreshToken, {
        path: '/',
        maxAge: 31536000, // 1 рік
        httpOnly: false, // Change to false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' // Захист від CSRF атак
      });
      // Keep old deviceId, since it does not change
      newResponse.cookies.set('device_id', deviceId, {
        path: '/',
        maxAge: 31536000, // 1 рік - device_id не змінюється
        httpOnly: false, // Change to false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' // Захист від CSRF атак
      });

      return newResponse;
    }

    return null;
  } catch {
    return null;
  }
}

// Note: isAuthenticated and refreshTokenClient moved to auth-utils.ts
// Use ensureValidToken and refreshAccessToken from auth-utils.ts instead
