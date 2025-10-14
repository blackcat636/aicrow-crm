import { cookies } from 'next/headers';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';
import { AuthProvider } from './auth-provider';
import { User } from '@/interface/User';
import { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";

export async function ServerAuthProvider({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get('access_token');
    let accessToken = accessTokenCookie?.value;
    
    let isAuth = false;
    let userData: User | null = null;

    if (accessToken) {
        try {
            isAuth = await isAuthenticatedServer(accessToken);
        } catch (error) {
            console.log('🔐 Server: Token validation error:', error);
            isAuth = false;
        }
        
        // If token is expired, try to refresh it
        if (!isAuth) {
            console.log('🔄 Server: Token expired, attempting to refresh...');
            
            try {
                // Create a mock request object for refreshAccessToken
                const mockRequest = {
                    cookies: {
                        get: (name: string) => {
                            const cookie = cookieStore.get(name);
                            return cookie ? { value: cookie.value } : undefined;
                        }
                    }
                } as NextRequest;
                
                const refreshResponse = await refreshAccessToken(mockRequest);
                
                if (refreshResponse) {
                    console.log('✅ Server: Token refreshed successfully');
                    // Get the new token from cookies
                    const newTokenCookie = refreshResponse.cookies.get('access_token');
                    if (newTokenCookie) {
                        accessToken = newTokenCookie.value;
                        try {
                            isAuth = await isAuthenticatedServer(accessToken);
                        } catch (error) {
                            console.log('🔐 Server: New token validation error:', error);
                            isAuth = false;
                        }
                    }
                } else {
                    console.log('❌ Server: Failed to refresh token');
                }
            } catch (error) {
                console.log('❌ Server: Token refresh error:', error);
            }
        }
    }

    // Try to get user data if authenticated
    if (isAuth && accessToken) {
        try {
            // Create headers for server request
            const serverHeaders = new Headers();
            serverHeaders.set('Authorization', `Bearer ${accessToken}`);

            // Execute request on server
            const response = await globalThis.fetch(`${API_URL}/users/profile`, {
                headers: serverHeaders,
                cache: 'no-store',
            });

            if (response.ok) {
                userData = await response.json();
            } else {
                console.log('❌ Server: User profile request failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Server: Error getting user data:', error);
        }
    } else {
        console.log('🔐 Server: User not authenticated, skipping profile fetch');
    }

    // Always render the children, even if not authenticated
    // This allows the app to work in "guest mode" for documentation
    return <AuthProvider initialUser={userData}>{children}</AuthProvider>;
} 
