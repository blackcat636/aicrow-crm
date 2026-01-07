import { cookies } from 'next/headers';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';
import { AuthProvider } from './auth-provider';
import { User } from '@/interface/User';
import { NextRequest } from 'next/server';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010").replace(/\/+$/, '');

export async function ServerAuthProvider({ children }: { children: React.ReactNode }) {
    // Wrap everything in try-catch to prevent any errors from breaking the app
    try {
        let cookieStore;
        try {
            cookieStore = await cookies();
        } catch (cookieError) {
            // If cookies() fails, render without auth
            if (process.env.NODE_ENV === 'development') {
                console.error('❌ ServerAuthProvider: Error accessing cookies:', cookieError);
            }
            return <AuthProvider initialUser={null}>{children}</AuthProvider>;
        }
        
        const accessTokenCookie = cookieStore.get('access_token');
        let accessToken = accessTokenCookie?.value;
        
        let isAuth = false;
        let userData: User | null = null;

        if (accessToken) {
            try {
                isAuth = await isAuthenticatedServer(accessToken);
            } catch (error) {
                // Silently handle token validation errors
                // This prevents errors from breaking the app
                if (process.env.NODE_ENV === 'development') {
                    console.error('❌ ServerAuthProvider: Token validation error:', error);
                }
                isAuth = false;
            }
            
            if (!isAuth) {
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
                        // Get the new token from cookies
                        const newTokenCookie = refreshResponse.cookies.get('access_token');
                        if (newTokenCookie) {
                            accessToken = newTokenCookie.value;
                            try {
                                isAuth = await isAuthenticatedServer(accessToken);
                            } catch (error) {
                                // Silently handle token validation errors
                                if (process.env.NODE_ENV === 'development') {
                                    console.error('❌ ServerAuthProvider: Refreshed token validation error:', error);
                                }
                                isAuth = false;
                            }
                        }
                    }
                } catch (error) {
                    // Silently handle refresh errors
                    if (process.env.NODE_ENV === 'development') {
                        console.error('❌ ServerAuthProvider: Token refresh error:', error);
                    }
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
                // Use fetch directly (works in both Node.js and Edge Runtime)
                const profileUrl = `${API_URL}/users/profile`;
                
                // Simple fetch with error handling - works in both Node.js and Edge Runtime
                const response = await fetch(profileUrl, {
                    headers: serverHeaders,
                    cache: 'no-store',
                }).catch((fetchError) => {
                    // If fetch fails (network error, API unavailable, etc.), return null
                    // This prevents the error from breaking the app
                    if (process.env.NODE_ENV === 'development') {
                        console.error('❌ Server: Fetch error getting user data:', fetchError);
                    }
                    return null;
                });

                if (response && response.ok) {
                    try {
                        const result = await response.json();
                        // Extract user data from response
                        userData = result.data || result;
                    } catch (jsonError) {
                        // If JSON parsing fails, silently continue without user data
                        if (process.env.NODE_ENV === 'development') {
                            console.error('❌ Server: JSON parse error:', jsonError);
                        }
                    }
                }
            } catch (error) {
                // Silently fail - don't break the app if user data fetch fails
                // This allows the app to work even if the API is temporarily unavailable
                // Only log in development to avoid cluttering production logs
                if (process.env.NODE_ENV === 'development') {
                    console.error('❌ Server: Error getting user data:', error);
                }
            }
        }

        // Always render the children, even if not authenticated
        // This allows the app to work in "guest mode" for documentation
        return <AuthProvider initialUser={userData}>{children}</AuthProvider>;
    } catch (error) {
        // Ultimate fallback - if anything goes wrong, still render the app
        // This prevents the entire app from crashing due to auth errors
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ ServerAuthProvider: Critical error, rendering without auth:', error);
        }
        return <AuthProvider initialUser={null}>{children}</AuthProvider>;
    }
} 
