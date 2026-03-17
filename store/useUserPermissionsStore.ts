'use client';

import { create } from 'zustand';
import { Permission } from '@/interface/Permission';
import { getUserPermissions } from '@/lib/api/roles';

interface UserPermissionsStore {
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  lastUserId: number | null;
  fetchUserPermissions: (userId: number | string) => Promise<void>;
  setPermissions: (permissions: Permission[], userId: number) => void;
  clearPermissions: () => void;
}

export const useUserPermissionsStore = create<UserPermissionsStore>(
  (set, get) => ({
    permissions: [],
    isLoading: false,
    error: null,
    lastUserId: null,

    fetchUserPermissions: async (userId: number | string) => {
      // Skip if userId is invalid
      const numericUserId = Number(userId);
      if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
        set({
          permissions: [],
          lastUserId: null,
          error: null,
          isLoading: false
        });
        return;
      }

      // Avoid duplicate fetches for the same user when data already exists
      const { lastUserId, permissions, isLoading } = get();
      if (lastUserId === numericUserId && permissions.length > 0) {
        return;
      }
      if (isLoading) {
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const response = await getUserPermissions(numericUserId);

        if (
          (response.status === 0 || response.status === 200) &&
          Array.isArray(response.data)
        ) {
          set({
            permissions: response.data as Permission[],
            lastUserId: numericUserId,
            error: null
          });
        } else {
          const friendlyMessage =
            response.status === 403
              ? "You don't have permission to view user permissions."
              : response.message || 'Failed to load permissions';
          set({
            permissions: [],
            lastUserId: numericUserId,
            error: friendlyMessage
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load permissions';
        set({
          permissions: [],
          lastUserId: numericUserId,
          error: message
        });
      } finally {
        set({ isLoading: false });
      }
    },

    setPermissions: (permissions: Permission[], userId: number) => {
      set({
        permissions,
        lastUserId: userId,
        error: null
      });
    },

    clearPermissions: () => {
      set({
        permissions: [],
        lastUserId: null,
        error: null,
        isLoading: false
      });
    }
  })
);
