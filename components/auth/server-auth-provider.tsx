import { cookies } from 'next/headers';
import { isAuthenticatedServer } from '@/lib/auth';
import { AuthProvider } from './auth-provider';
import { User } from '@/interface/User';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";

export async function ServerAuthProvider({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get('access_token');
    const accessToken = accessTokenCookie?.value;
    
    const isAuth = await isAuthenticatedServer(accessToken);
    let userData: User | null = null;

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
            console.error('Error getting user data on server:', error);
        }
    }

    return <AuthProvider initialUser={userData}>{children}</AuthProvider>;
} 
