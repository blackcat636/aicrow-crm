import { create } from 'zustand';
import { getAllPermissions, getChildPermissions } from '@/lib/api/permissions';
import { Permission, PermissionsApiResponse } from '@/interface/Permission';

interface PermissionsStore {
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  fetchPermissions: () => Promise<void>;
  updatePermissionInStore: (updatedPermission: Permission) => void;
  removePermissionFromStore: (permissionId: number) => void;
  addPermissionToStore: (permission: Permission) => void;
}

export const usePermissionsStore = create<PermissionsStore>((set, get) => ({
  permissions: [],
  isLoading: false,
  error: null,

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllPermissions();

      if (
        (response.status === 0 || response.status === 200) &&
        response.data
      ) {
        // Fetch child permissions for each permission
        const permissionsWithChildren = await Promise.all(
          response.data.map(async (permission) => {
            try {
              const childrenResponse = await getChildPermissions(permission.id);
              if (childrenResponse.data && Array.isArray(childrenResponse.data)) {
                return {
                  ...permission,
                  children: childrenResponse.data
                };
              }
              return {
                ...permission,
                children: permission.children || []
              };
            } catch (error) {
              // If fetching children fails, keep the permission without children
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Failed to fetch children for permission ${permission.id}:`, error);
              }
              return {
                ...permission,
                children: permission.children || []
              };
            }
          })
        );

        set({
          permissions: permissionsWithChildren,
          error: null
        });
      } else {
        set({ error: response.message || 'Error loading permissions' });
      }
    } catch (error) {
      set({ error: 'Error loading permissions' });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePermissionInStore: (updatedPermission: Permission) => {
    set((state) => ({
      permissions: state.permissions.map((permission) =>
        permission.id === updatedPermission.id
          ? updatedPermission
          : permission
      )
    }));
  },

  removePermissionFromStore: (permissionId: number) => {
    set((state) => ({
      permissions: state.permissions.filter(
        (permission) => permission.id !== permissionId
      )
    }));
  },

  addPermissionToStore: (permission: Permission) => {
    set((state) => ({
      permissions: [...state.permissions, permission]
    }));
  }
}));
