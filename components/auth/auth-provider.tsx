"use client"

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useUserPermissionsStore } from '@/store/useUserPermissionsStore';
import { useModulesStore } from '@/store/useModulesStore';
import { User } from '@/interface/User';
import { ensureValidToken } from '@/lib/auth-utils';
import { coerceNumericUserId, extractNumericUserIdFromAccessToken } from '@/lib/auth-user-id';

interface AuthProviderProps {
    children: React.ReactNode;
    initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const { user, setUser } = useUserStore();
  const clearPermissions = useUserPermissionsStore(
    (state) => state.clearPermissions
  );
  const setOverrideUser = useModulesStore((state) => state.setOverrideUser);

  // Set initial user data
  useEffect(() => {
    if (initialUser && !user) {
      // Normalize user id to numeric because some API responses return UUID in `id`.
      const initialObj = initialUser as unknown as Record<string, unknown>;
      const initialId = initialObj.id;
      const normalizedId =
        coerceNumericUserId(initialId) ?? extractNumericUserIdFromAccessToken();
      if (normalizedId && initialId !== normalizedId) {
        setUser({ ...(initialObj as unknown as User), id: normalizedId });
      } else {
      setUser(initialUser);
      }
    }
  }, [initialUser, user, setUser]);

  // Fetch permissions when user changes
  useEffect(() => {
    const rawUserId = user?.id ?? initialUser?.id;
    const userIdFromStore = user?.id;
    const numericUserId =
      coerceNumericUserId(rawUserId) ??
      coerceNumericUserId(userIdFromStore) ??
      extractNumericUserIdFromAccessToken();

    if (numericUserId) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[auth] user detected; setting override user', {
          rawUserId,
          userId: numericUserId,
          hasUserInStore: Boolean(user?.id),
          hasInitialUser: Boolean(initialUser?.id),
        });
      }
      setOverrideUser(numericUserId);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('[auth] no user; clearing permissions + override user');
    }
    clearPermissions();
    setOverrideUser(null);
  }, [
    user?.id,
    initialUser?.id,
    clearPermissions,
    setOverrideUser,
  ]);

  // Background token upkeep: refreshes tokens even if user is idle (no API calls)
  useEffect(() => {
    // Run once on mount, then every 30s
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await ensureValidToken();
    };

    void tick();
    const id = window.setInterval(() => void tick(), 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return <>{children}</>;
} 
