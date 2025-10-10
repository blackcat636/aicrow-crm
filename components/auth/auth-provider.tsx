"use client"

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { User } from '@/interface/User';

interface AuthProviderProps {
    children: React.ReactNode;
    initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
    const { user, setUser } = useUserStore();

    // Set initial user data
    useEffect(() => {
        if (initialUser && !user) {
            setUser(initialUser);
        }
    }, [initialUser, user, setUser]);


    return <>{children}</>;
} 
