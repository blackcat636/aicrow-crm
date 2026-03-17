import { create } from 'zustand';
import { getAllPermissions, getChildPermissions } from '@/lib/api/permissions';
import { Permission, PermissionsApiResponse } from '@/interface/Permission';
import { useModulesStore } from '@/store/useModulesStore';

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
    let modulesState = useModulesStore.getState();
    if (!modulesState.permissionsReady) {
      await modulesState.fetchModules();
      modulesState = useModulesStore.getState();
      if (!modulesState.permissionsReady) {
        return;
      }
    }

    if (!modulesState.hasPermission('permissions', 'can_view')) {
      set({
        permissions: [],
        isLoading: false,
        error: "You don't have permission to view permissions."
      });
      return;
    }

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
        const friendlyMessage =
          response.status === 403
            ? "You don't have permission to view permissions."
            : response.message || 'Error loading permissions.';
        set({ error: friendlyMessage });

        if (response.status === 403) {
          // Keep menu/UI consistent: if backend denies, hide the whole module.
          useModulesStore.getState().overrideModulePermissions('permissions', {
            can_view: false,
            can_edit: false,
            can_delete: false
          });
        }
      }
    } catch (error) {
      const friendlyMessage =
        error instanceof Error ? error.message : 'Error loading permissions.';
      set({ error: friendlyMessage });
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
