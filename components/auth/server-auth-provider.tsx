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
        } catch {
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
                        } catch {
                            isAuth = false;
                        }
                    }
                }
            } catch {
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
            }
        } catch (error) {
            console.error('❌ Server: Error getting user data:', error);
        }
    }

    // Always render the children, even if not authenticated
    // This allows the app to work in "guest mode" for documentation
    return <AuthProvider initialUser={userData}>{children}</AuthProvider>;
} 
